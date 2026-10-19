import type { Request, Response } from "express";
import { AuthRequest } from "../auth/auth.middleware.js";
import { StockService } from "./stock.service.js";
import { StockError } from "./stock.types.js";
import { BadRequestStatus, ForbiddenStatus, NotFoundStatus, SuccessStatus } from "../../utils/response.js";

const service = StockService();

const caller = (req: Request) => (req as AuthRequest).user;

/** Maps the service's error codes onto the HTTP statuses the client expects. */
const handle = (res: Response, error: unknown): Response => {
    if (error instanceof StockError) {
        switch (error.code) {
            case "FORBIDDEN":
                return ForbiddenStatus(res, error.message);
            case "BRANCH_NOT_FOUND":
            case "PRODUCT_NOT_FOUND":
                return NotFoundStatus(res, error.message);
            default:
                return BadRequestStatus(res, error.message);
        }
    }
    throw error;
};

export const StockController = () => {
    const getBranchStock = async (req: Request, res: Response) => {
        const branchId = Number(req.params.branchId);
        try {
            return SuccessStatus(res, await service.getMenuStock(caller(req)!, branchId));
        } catch (error) {
            return handle(res, error);
        }
    };

    const setProductStock = async (req: Request, res: Response) => {
        const branchId = Number(req.params.branchId);
        const productId = Number(req.params.productId);
        const quantity = Number(req.body?.quantity);
        const thresholdRaw = req.body?.lowStockThreshold;
        // Threshold is optional on edit: leaving it out keeps whatever the
        // branch already had instead of resetting to the default.
        const lowStockThreshold = thresholdRaw === undefined ? undefined : Number(thresholdRaw);
        if (thresholdRaw !== undefined && (!Number.isInteger(lowStockThreshold) || lowStockThreshold! < 0)) {
            return BadRequestStatus(res, "Low-stock threshold must be a non-negative whole number");
        }

        try {
            return SuccessStatus(
                res,
                await service.setProductStock(caller(req)!, branchId, productId, { quantity, lowStockThreshold })
            );
        } catch (error) {
            return handle(res, error);
        }
    };


    const getAvailableStock = async (req: Request, res: Response) => {
        const branchId = Number(req.params.branchId);
        // One product still arrives as a plain string; a list as "1,2,3".
        const productIds = Array.isArray(req.query.productIds)
            ? (req.query.productIds as unknown[]).map((v) => Number(v))
            : typeof req.query.productIds === "string"
              ? req.query.productIds.split(",").map((v) => Number(v.trim()))
              : typeof req.query.productId === "string"
                ? [Number(req.query.productId)]
                : [];
        const unique = [...new Set(productIds.filter((id) => Number.isInteger(id) && id > 0))];
        if (unique.length === 0) {
            return BadRequestStatus(res, "Provide at least one product id");
        }
        if (unique.length > 50) {
            return BadRequestStatus(res, "At most 50 product ids per request");
        }
        try {
            return SuccessStatus(res, await service.getAvailableStock(branchId, unique));
        } catch (error) {
            return handle(res, error);
        }
    };
    return { getBranchStock, getAvailableStock, setProductStock };
};
