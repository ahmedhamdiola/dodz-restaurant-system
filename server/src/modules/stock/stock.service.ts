import { UserRepository } from "../users/user.repository.js";
import { AuthUser } from "../auth/auth.types.js";
import { StockRepository } from "./stock.repository.js";
import { ProductAvailability, SetStockInput, StockError } from "./stock.types.js";

export const StockService = () => {
    const repo = StockRepository();
    const users = UserRepository();

    /**
     * Main admins may open any branch; a branch admin only their own. Anyone
     * else (customer, staff) is out. The caller's branch is read from the
     * users table rather than the JWT so a reassignment takes effect without
     * forcing a re-login.
     */
    const assertBranchAccess = async (caller: AuthUser, branchId: number) => {
        if (caller.role === "admin") {
            return;
        }
        if (caller.role === "branch_admin") {
            const me = await users.getUserByID(caller.id);
            if (me && me.branch_id === branchId) {
                return;
            }
            throw new StockError("FORBIDDEN", "You can only access your own branch");
        }
        throw new StockError("FORBIDDEN", "Forbidden");
    };

    const assertBranch = async (branchId: number) => {
        if (!Number.isInteger(branchId) || branchId <= 0) {
            throw new StockError("INVALID_INPUT", "Invalid branch id");
        }
        if (!(await repo.branchExists(branchId))) {
            throw new StockError("BRANCH_NOT_FOUND", "Branch not found");
        }
    };

    const getMenuStock = async (caller: AuthUser, branchId: number) => {
        // Access first so a customer cannot probe which branch ids exist.
        await assertBranchAccess(caller, branchId);
        await assertBranch(branchId);
        return repo.getMenuStock(branchId);
    };

    const setProductStock = async (caller: AuthUser, branchId: number, productId: number, input: SetStockInput) => {
        await assertBranchAccess(caller, branchId);
        await assertBranch(branchId);

        if (!Number.isInteger(productId) || productId <= 0) {
            throw new StockError("INVALID_INPUT", "Invalid product id");
        }
        if (!Number.isInteger(input.quantity) || input.quantity < 0) {
            throw new StockError("INVALID_INPUT", "Quantity must be a non-negative whole number");
        }
        if (input.lowStockThreshold !== undefined && (!Number.isInteger(input.lowStockThreshold) || input.lowStockThreshold < 0)) {
            throw new StockError("INVALID_INPUT", "Low-stock threshold must be a non-negative whole number");
        }
        if (!(await repo.productExists(productId))) {
            throw new StockError("PRODUCT_NOT_FOUND", "Product not found");
        }

        // A quick edit only sends quantity; keep the branch's threshold (or the
        // default) rather than resetting it.
        const existing = await repo.getStock(branchId, productId);
        const lowStockThreshold = input.lowStockThreshold ?? existing?.low_stock_threshold ?? 10;

        return repo.setStock(branchId, productId, { quantity: input.quantity, lowStockThreshold });
    };

    const getAvailableStock = async (branchId: number, productIds: number[]): Promise<ProductAvailability[]> => {
        await assertBranch(branchId);
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return [];
        }
        const ids = productIds
            .filter((id) => Number.isInteger(id) && id > 0)
            .filter((id, i, arr) => arr.indexOf(id) === i);
        if (ids.length === 0) {
            return [];
        }
        const rows = await repo.getAvailableStock(branchId, ids);
        // The storefront only needs to know whether it can order the item; the
        // exact count is business data and stays on the admin side.
        return rows.map((row) => ({
            productId: row.productId,
            available: row.isAvailable && row.quantity > 0,
        }));
    };

    return {
        getMenuStock,
        setProductStock,
        getAvailableStock,
    };
};
