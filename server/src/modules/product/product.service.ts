import { ProductRepository } from "./product.repository.js";
import { ProductInterfaceWithoutID } from "./product.types.js";
import { ProductOptionsService } from "./product.options.service.js";
import {
    ModifierProduct,
    OptionGroup,
    OptionTreeInput,
    OptionValuePatch,
} from "./product.options.types.js";

export const ProductService = () => {
    const repository = ProductRepository();
    const optionsService = ProductOptionsService();

    const getProductsByCategoryID = async (id: number, includeUnavailable = false) => {

        /*
        const category = await categoryRepository.getCategoryByID(id);
        if (!category) {
            return null;
        }
        */

        return repository.getProductsByCategoryID(id, includeUnavailable);
    }

    const getAllProducts = async (includeUnavailable = false) => {
        return repository.getAllProducts(includeUnavailable);
    }

    /** storefrontOnly is set by the public endpoint; admin flows see everything. */
    const getProductByID = async (id: number, storefrontOnly = false) => {
        if (!id || id <= 0) {
            return null;
        }

        return repository.getProductByID(id, storefrontOnly);
    }

    const getTopDealsProducts = async () => {
        return repository.getTopDealsProducts();
    }

    // ---------------------------------------------------------- option tree

    const getProductOptions = async (id: number, includeUnavailable = false) => {
        if (!id || id <= 0) {
            return null;
        }
        return optionsService.getProductOptions(id, includeUnavailable);
    }

    const replaceProductOptions = async (id: number, input: OptionTreeInput) => {
        if (!id || id <= 0) {
            return { ok: false, code: "INVALID", message: "Invalid product id" } as const;
        }
        return optionsService.replaceProductOptions(id, input);
    }

    const deleteProductOption = async (productID: number, optionID: number) => {
        if (!productID || productID <= 0 || !optionID || optionID <= 0) {
            return { ok: false as const, code: "NOT_FOUND" as const, message: "Option group not found" };
        }
        return optionsService.deleteProductOption(productID, optionID);
    }

    const patchProductOptionValue = async (valueID: number, patch: OptionValuePatch) => {
        if (!valueID || valueID <= 0) {
            return { error: "Invalid option value id" };
        }
        return optionsService.patchProductOptionValue(valueID, patch);
    }

    const getModifierProducts = async (): Promise<ModifierProduct[]> => {
        return optionsService.getModifierProducts();
    }

    const createProduct = async (product: ProductInterfaceWithoutID) => {
        /*
        const category = await categoryRepository.getCategoryByID(product.categoryID);
        if (!category) {
            return null;
        }
        */

        const existingProduct = await repository.getProductByName(product.name);
        if (existingProduct) {
            return null;
        }

        const created = await repository.createProduct(product);

        // Every active branch starts with a neutral count for the new item so
        // the branch dashboards show it immediately instead of reading as "out
        // of stock" (COALESCE on a missing row) — branches overwrite it.
        if (created) {
            await repository.seedBranchStock(created.id);
        }
        return created;
    }

    const updateProduct = async (id: number, product: ProductInterfaceWithoutID) => {
        /*
        const category = await categoryRepository.getCategoryByID(product.categoryID);
        if (!category) {
            return null;
        }
        */

        const existingProduct = await repository.getProductByID(id);
        if (!existingProduct) {
            return null;
        }

        return repository.updateProduct(id, product);
    }

    const deleteProduct = async (id: number) => {
        const existingProduct = await repository.getProductByID(id);
        if (!existingProduct) {
            return null;
        }

        return repository.deleteProduct(id);
    }

    return {
        getProductsByCategoryID,
        getAllProducts,
        getProductByID,
        getTopDealsProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        getProductOptions,
        replaceProductOptions,
        deleteProductOption,
        patchProductOptionValue,
        getModifierProducts,
    };
};
