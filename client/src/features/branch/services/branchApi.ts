import { api, unwrap } from "../../../lib/api";
import type {
    BranchAlert,
    BranchAlertStatus,
    BranchInfo,
    BranchStockItem,
    SendAlertInput,
    StockUpdate,
} from "../types";

// Rejections are rewritten into a plain Error so react-query mutations can
// surface the server's message in the UI (same approach as couponsApi).
interface ErrorLike {
    response?: { data?: { message?: string } };
    message?: string;
}

const toError = (err: unknown): never => {
    if (err instanceof Error) {
        throw err;
    }
    const like = err as ErrorLike;
    if (like.response?.data?.message) {
        const error = new Error(like.response.data.message) as Error & ErrorLike;
        error.response = like.response;
        throw error;
    }
    throw err;
};

/** Shape the stock endpoint actually returns (camelCase, mapped in the repository). */
interface StockItemDTO {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    isAvailable: boolean;
    categoryName: string;
    categorySlug: string;
    quantity: number;
    lowStockThreshold: number;
}

const mapStockItem = (dto: StockItemDTO): BranchStockItem => ({
    id: dto.id,
    name: dto.name,
    description: dto.description,
    price: dto.price,
    image: dto.image,
    isAvailable: dto.isAvailable,
    categoryName: dto.categoryName,
    categorySlug: dto.categorySlug,
    quantity: dto.quantity,
    lowStockThreshold: dto.lowStockThreshold,
});

export const branchApi = {
    /** The branch's identity for the dashboard header (public endpoint). */
    getBranch(branchId: number): Promise<BranchInfo> {
        return unwrap<BranchInfo>(api.get(`/branches/${branchId}`)).catch(toError);
    },

    getStock(branchId: number): Promise<BranchStockItem[]> {
        return unwrap<StockItemDTO[]>(api.get(`/stock/branch/${branchId}`))
            .then((items) => items.map(mapStockItem))
            .catch(toError);
    },

    /** Upserts the branch's count for one product. */
    setStock(branchId: number, productId: number, update: StockUpdate): Promise<void> {
        return unwrap<unknown>(
            api.put(`/stock/branch/${branchId}/product/${productId}`, update)
        )
            .then(() => undefined)
            .catch(toError);
    },

    /** The caller's own inbox: all branches for a main admin, own for a branch admin. */
    getAlerts(params: { status?: BranchAlertStatus; branchId?: number } = {}): Promise<BranchAlert[]> {
        return unwrap<BranchAlert[]>(api.get("/alerts", { params })).catch(toError);
    },

    sendAlert(input: SendAlertInput): Promise<BranchAlert> {
        return unwrap<BranchAlert>(api.post("/alerts", input)).catch(toError);
    },

    updateAlertStatus(id: number, status: BranchAlertStatus): Promise<BranchAlert> {
        return unwrap<BranchAlert>(api.patch(`/alerts/${id}/status`, { status })).catch(toError);
    },

    getPendingCount(): Promise<number> {
        return unwrap<{ count: number }>(api.get("/alerts/pending-count"))
            .then((result) => result.count)
            .catch(toError);
    },
};
