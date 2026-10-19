// Per-branch inventory view: the global menu joined with one branch's counts.
// Stock rows are per (branch, product); products themselves stay global.

export interface BranchStockItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    /** Global storefront flag — visible for context, only main admins edit it. */
    isAvailable: boolean;
    categoryName: string;
    categorySlug: string;
    /** Units left at this branch; 0 = out of stock. */
    quantity: number;
    /** At or below this the dashboard flags the item as low stock. */
    lowStockThreshold: number;
}

export interface SetStockInput {
    quantity: number;
    // Omitted on a quick quantity edit: the branch keeps its existing threshold.
    lowStockThreshold?: number;
}

/** Full row for internal use; the storefront never receives the counts. */
export interface AvailableProductStock {
    productId: number;
    quantity: number;
    lowStockThreshold: number;
    isAvailable: boolean;
}

/** What a storefront checkout is allowed to know about a product. */
export interface ProductAvailability {
    productId: number;
    available: boolean;
}

export type StockErrorCode =
    | "FORBIDDEN"
    | "BRANCH_NOT_FOUND"
    | "PRODUCT_NOT_FOUND"
    | "INVALID_INPUT";

/**
 * Errors are thrown from the service and mapped to HTTP statuses in the
 * controller, mirroring the coupon module: the code picks the status, the
 * message is what the UI shows.
 */
export class StockError extends Error {
    readonly code: StockErrorCode;

    constructor(code: StockErrorCode, message: string) {
        super(message);
        this.name = "StockError";
        this.code = code;
    }
}
