import { Pool, PoolClient } from "pg";
import {
    ModifierProduct,
    OptionGroup,
    OptionValue,
    OptionValuePatch,
    SelectableProduct,
} from "./product.options.types.js";

// Same alias convention as cart.repository.ts: every helper accepts either the
// module pool or an in-transaction client (both expose .query).
type Db = Pool | PoolClient;

// ------------------------------------------------------------------ row shapes

interface OptionRow {
    id: number;
    product_id: number;
    name: string;
    type: "radio" | "checkbox" | "quantity";
    is_required: boolean;
    min_selections: number;
    max_selections: number | null;
    sort_order: number;
    is_available: boolean;
    linked_group_id: number | null;
    linked_total: number | null;
    unit_label: string | null;
}

interface ValueRow {
    id: number;
    option_id: number;
    name: string;
    description: string | null;
    price_delta: string | number;
    is_default: boolean;
    is_available: boolean;
    sort_order: number;
    modifier_product_id: number | null;
    modifier: { id: number; name: string; image: string; price: string | number } | null;
}

const VALUE_COLUMNS = `
    ov.id, ov.option_id, ov.name, ov.description, ov.price_delta, ov.is_default,
    ov.is_available, ov.sort_order, ov.modifier_product_id,
    CASE WHEN mp.id IS NULL THEN NULL
         ELSE jsonb_build_object('id', mp.id, 'name', mp.name, 'image', mp.image, 'price', mp.price)
    END AS modifier
`;

const toOptionValue = (row: ValueRow): OptionValue => ({
    id: row.id,
    option_id: row.option_id,
    name: row.name,
    description: row.description,
    price_delta: Number(row.price_delta),
    is_default: row.is_default,
    is_available: row.is_available,
    sort_order: row.sort_order,
    modifier_product_id: row.modifier_product_id,
    modifier: row.modifier
        ? {
              id: row.modifier.id,
              name: row.modifier.name,
              image: row.modifier.image,
              price: Number(row.modifier.price),
          }
        : null,
});

const toOptionGroup = (row: OptionRow, values: OptionValue[]): OptionGroup => ({
    id: row.id,
    product_id: row.product_id,
    name: row.name,
    type: row.type,
    is_required: row.is_required,
    min_selections: row.min_selections,
    max_selections: row.max_selections,
    sort_order: row.sort_order,
    is_available: row.is_available,
    linked_group_id: row.linked_group_id,
    linked_total: row.linked_total,
    unit_label: row.unit_label,
    values,
});

export const ProductOptionsRepository = () => {
    // ------------------------------------------------------------ read

    /**
     * Full option tree for one or more products, including unavailable rows.
     * Used by the storefront/admin tree endpoint and by the authoritative
     * selection validation (which must be able to tell "sold out" from
     * "does not belong to this product").
     */
    const getOptionTreeByProductIDs = async (
        db: Db,
        productIDs: number[],
        includeUnavailable: boolean
    ): Promise<Map<number, OptionGroup[]>> => {
        const tree = new Map<number, OptionGroup[]>();
        if (productIDs.length === 0) {
            return tree;
        }

        const groupsResult = await db.query<OptionRow>(
            `SELECT po.id, po.product_id, po.name, po.type, po.is_required, po.min_selections,
                    po.max_selections, po.sort_order, po.is_available,
                    po.linked_group_id, po.linked_total, po.unit_label
             FROM product_options po
             WHERE po.product_id = ANY($1::int[])
               AND ($2::boolean OR po.is_available)
             ORDER BY po.product_id, po.sort_order, po.id`,
            [productIDs, includeUnavailable]
        );

        const valuesResult = await db.query<ValueRow & { product_id: number }>(
            `SELECT ${VALUE_COLUMNS}, po.product_id
             FROM option_values ov
             JOIN product_options po ON po.id = ov.option_id
             LEFT JOIN products mp ON mp.id = ov.modifier_product_id
             WHERE po.product_id = ANY($1::int[])
               AND ($2::boolean OR ov.is_available)
               AND ($2::boolean OR po.is_available)
             ORDER BY po.product_id, po.sort_order, ov.sort_order, ov.id`,
            [productIDs, includeUnavailable]
        );

        for (const row of groupsResult.rows) {
            tree.set(row.product_id, [...(tree.get(row.product_id) ?? []), toOptionGroup(row, [])]);
        }
        for (const row of valuesResult.rows) {
            const groups = tree.get(row.product_id);
            const group = groups?.find((candidate) => candidate.id === row.option_id);
            group?.values.push(toOptionValue(row));
        }
        return tree;
    };

    const getProductOptionTree = async (db: Db, productID: number, includeUnavailable: boolean) => {
        const tree = await getOptionTreeByProductIDs(db, [productID], includeUnavailable);
        return tree.get(productID) ?? [];
    };

    /** Product row used to price/validate a selection. Excludes deleted products. */
    const getSelectableProduct = async (db: Db, productID: number): Promise<SelectableProduct | null> => {
        const result = await db.query<SelectableProduct>(
            `SELECT id, name, price, is_available, is_modifier
             FROM products WHERE id = $1 AND is_deleted = false`,
            [productID]
        );
        return result.rows[0] ?? null;
    };

    const getSelectableProducts = async (db: Db, productIDs: number[]): Promise<Map<number, SelectableProduct>> => {
        if (productIDs.length === 0) {
            return new Map();
        }
        const result = await db.query<SelectableProduct>(
            `SELECT id, name, price, is_available, is_modifier
             FROM products WHERE id = ANY($1::int[]) AND is_deleted = false`,
            [productIDs]
        );
        return new Map(result.rows.map((row) => [row.id, row]));
    };

    // ------------------------------------------------------------ write

    const getOptionIDsForProduct = async (db: Db, productID: number): Promise<number[]> => {
        const result = await db.query<{ id: number }>(
            "SELECT id FROM product_options WHERE product_id = $1 ORDER BY sort_order, id",
            [productID]
        );
        return result.rows.map((row) => row.id);
    };

    const getValueIDsForOption = async (db: Db, optionID: number): Promise<number[]> => {
        const result = await db.query<{ id: number }>("SELECT id FROM option_values WHERE option_id = $1", [optionID]);
        return result.rows.map((row) => row.id);
    };

    const insertOption = async (
        db: Db,
        productID: number,
        input: {
            name: string;
            type: "radio" | "checkbox" | "quantity";
            is_required: boolean;
            min_selections: number;
            max_selections: number | null;
            sort_order: number;
            is_available: boolean;
            linked_group_id: number | null;
            linked_total: number | null;
            unit_label: string | null;
        }
    ): Promise<number> => {
        const result = await db.query<{ id: number }>(
            `INSERT INTO product_options (product_id, name, type, is_required, min_selections, max_selections, sort_order, is_available, linked_group_id, linked_total, unit_label)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING id`,
            [
                productID,
                input.name,
                input.type,
                input.is_required,
                input.min_selections,
                input.max_selections,
                input.sort_order,
                input.is_available,
                input.linked_group_id,
                input.linked_total,
                input.unit_label,
            ]
        );
        return result.rows[0].id;
    };

    const updateOption = async (
        db: Db,
        optionID: number,
        input: {
            name: string;
            type: "radio" | "checkbox" | "quantity";
            is_required: boolean;
            min_selections: number;
            max_selections: number | null;
            sort_order: number;
            is_available: boolean;
            linked_group_id: number | null;
            linked_total: number | null;
            unit_label: string | null;
        }
    ): Promise<void> => {
        await db.query(
            `UPDATE product_options
             SET name = $2, type = $3, is_required = $4, min_selections = $5, max_selections = $6,
                 sort_order = $7, is_available = $8, linked_group_id = $9, linked_total = $10,
                 unit_label = $11, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [
                optionID,
                input.name,
                input.type,
                input.is_required,
                input.min_selections,
                input.max_selections,
                input.sort_order,
                input.is_available,
                input.linked_group_id,
                input.linked_total,
                input.unit_label,
            ]
        );
    };

    const setOptionLink = async (db: Db, optionID: number, linkedGroupID: number): Promise<void> => {
        await db.query(
            `UPDATE product_options
             SET linked_group_id = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [optionID, linkedGroupID]
        );
    };

    const deleteOptionsNotIn = async (db: Db, productID: number, keepIDs: number[]): Promise<void> => {
        // '<> ALL(empty)' is TRUE for every row, so an empty keep list removes all groups.
        await db.query("DELETE FROM product_options WHERE product_id = $1 AND NOT (id = ANY($2::int[]))", [
            productID,
            keepIDs,
        ]);
    };

    const insertValue = async (
        db: Db,
        optionID: number,
        input: {
            name: string;
            description: string | null;
            price_delta: number;
            is_default: boolean;
            is_available: boolean;
            sort_order: number;
            modifier_product_id: number | null;
        }
    ): Promise<number> => {
        const result = await db.query<{ id: number }>(
            `INSERT INTO option_values (option_id, name, description, price_delta, is_default, is_available, sort_order, modifier_product_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [
                optionID,
                input.name,
                input.description,
                input.price_delta,
                input.is_default,
                input.is_available,
                input.sort_order,
                input.modifier_product_id,
            ]
        );
        return result.rows[0].id;
    };

    const updateValue = async (
        db: Db,
        valueID: number,
        input: {
            name: string;
            description: string | null;
            price_delta: number;
            is_default: boolean;
            is_available: boolean;
            sort_order: number;
            modifier_product_id: number | null;
        }
    ): Promise<void> => {
        await db.query(
            `UPDATE option_values
             SET name = $2, description = $3, price_delta = $4, is_default = $5, is_available = $6,
                 sort_order = $7, modifier_product_id = $8, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [
                valueID,
                input.name,
                input.description,
                input.price_delta,
                input.is_default,
                input.is_available,
                input.sort_order,
                input.modifier_product_id,
            ]
        );
    };

    const deleteValuesNotIn = async (db: Db, optionID: number, keepIDs: number[]): Promise<void> => {
        await db.query("DELETE FROM option_values WHERE option_id = $1 AND NOT (id = ANY($2::int[]))", [
            optionID,
            keepIDs,
        ]);
    };

    /**
     * The counted partner of this group and its name, in either direction, or null
     * when the group belongs to no pair.
     *
     * `linked_group_id` is ON DELETE CASCADE, so deleting one half of a pair would
     * silently take the partner (and all its values) with it. Callers use this to
     * refuse the delete instead. Scoped to `productID` so a group id from another
     * product resolves to null and falls through to the NOT_FOUND path.
     */
    const getLinkedPartner = async (
        db: Db,
        productID: number,
        optionID: number
    ): Promise<{ id: number; name: string } | null> => {
        const result = await db.query<{ id: number; name: string }>(
            `SELECT po.id, po.name
             FROM product_options po
             WHERE po.product_id = $1
               AND (po.id = $2 OR po.linked_group_id = $2)
               AND po.id <> $2
             ORDER BY (po.id = $2) DESC
             LIMIT 1`,
            [productID, optionID]
        );
        return result.rows[0] ?? null;
    };

    const deleteOption = async (db: Db, productID: number, optionID: number): Promise<number | null> => {
        const result = await db.query<{ id: number }>(
            "DELETE FROM product_options WHERE product_id = $1 AND id = $2 RETURNING id",
            [productID, optionID]
        );
        return result.rows[0]?.id ?? null;
    };

    const getOptionValue = async (db: Db, valueID: number): Promise<OptionValue | null> => {
        const result = await db.query<ValueRow & { product_id: number }>(
            `SELECT ${VALUE_COLUMNS}, po.product_id
             FROM option_values ov
             JOIN product_options po ON po.id = ov.option_id
             LEFT JOIN products mp ON mp.id = ov.modifier_product_id
             WHERE ov.id = $1`,
            [valueID]
        );
        const row = result.rows[0];
        return row ? toOptionValue(row) : null;
    };

    const patchOptionValue = async (
        db: Db,
        valueID: number,
        patch: Required<OptionValuePatch>
    ): Promise<OptionValue | null> => {
        if (patch.is_default) {
            // One pre-selected value per group: a radio group with two defaults
            // would be ambiguous for the storefront.
            await db.query("UPDATE option_values SET is_default = false, updated_at = CURRENT_TIMESTAMP WHERE option_id = (SELECT option_id FROM option_values WHERE id = $1) AND id <> $1", [valueID]);
        }
        const result = await db.query(
            `UPDATE option_values
             SET is_available = $2, price_delta = $3, is_default = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING id`,
            [valueID, patch.is_available, patch.price_delta, patch.is_default]
        );
        if (result.rowCount === 0) {
            return null;
        }
        return getOptionValue(db, valueID);
    };

    /** Modifier products that can be attached to an option value. */
    const listModifierProducts = async (db: Db): Promise<ModifierProduct[]> => {
        const result = await db.query<{
            id: number;
            name: string;
            image: string;
            price: number;
            category_name: string;
            is_available: boolean;
        }>(
            `SELECT p.id, p.name, p.image, p.price, c.name AS category_name, p.is_available
             FROM products p
             JOIN categories c ON c.id = p.category_id
             WHERE p.is_modifier = true AND p.is_deleted = false AND c.is_deleted = false
             ORDER BY c.name, p.name`
        );
        return result.rows;
    };

    /** Confirms every referenced modifier id really is a modifier product. */
    const getModifierProductIDs = async (db: Db, ids: number[]): Promise<Set<number>> => {
        if (ids.length === 0) {
            return new Set();
        }
        const result = await db.query<{ id: number }>(
            "SELECT id FROM products WHERE id = ANY($1::int[]) AND is_modifier = true AND is_deleted = false",
            [ids]
        );
        return new Set(result.rows.map((row) => row.id));
    };

    /** Keeps products.is_customizable honest without hiding the tree from the admin. */
    const setProductCustomizable = async (db: Db, productID: number, customizable: boolean): Promise<void> => {
        await db.query(
            `UPDATE products SET is_customizable = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND is_customizable <> $2`,
            [productID, customizable]
        );
    };

    return {
        getOptionTreeByProductIDs,
        getProductOptionTree,
        getSelectableProduct,
        getSelectableProducts,
        getOptionIDsForProduct,
        getValueIDsForOption,
        insertOption,
        updateOption,
        setOptionLink,
        deleteOptionsNotIn,
        insertValue,
        updateValue,
        deleteValuesNotIn,
        getLinkedPartner,
        deleteOption,
        getOptionValue,
        patchOptionValue,
        listModifierProducts,
        getModifierProductIDs,
        setProductCustomizable,
    };
};

export type ProductOptionsRepositoryType = ReturnType<typeof ProductOptionsRepository>;
