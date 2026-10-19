import type { Request, Response } from "express";
import { AuthRequest } from "../auth/auth.middleware.js";
import { AlertService } from "./alert.service.js";
import { AlertError, AlertFilters, BranchAlertStatus } from "./alert.types.js";
import { BadRequestStatus, CreateStatus, ForbiddenStatus, NotFoundStatus, SuccessStatus } from "../../utils/response.js";

const service = AlertService();

const currentUser = (req: Request) => (req as AuthRequest).user!;

export const AlertController = () => {
    const createAlert = async (req: Request, res: Response) => {
        try {
            const alert = await service.createAlert(currentUser(req), {
                type: req.body?.type,
                message: req.body?.message,
            });
            return CreateStatus(res, alert);
        } catch (error) {
            return handleError(res, error);
        }
    };

    /** Main admin inbox (all branches) or a branch admin's own history. */
    const getAlerts = async (req: Request, res: Response) => {
        const filters: AlertFilters = {};
        if (typeof req.query.status === "string" && req.query.status !== "all") {
            filters.status = req.query.status as BranchAlertStatus;
        }
        if (req.query.branchId !== undefined) {
            const branchId = Number(req.query.branchId);
            if (!Number.isInteger(branchId)) {
                return BadRequestStatus(res, "Invalid branchId filter");
            }
            filters.branchId = branchId;
        }

        try {
            return SuccessStatus(res, await service.listAlerts(currentUser(req), filters));
        } catch (error) {
            return handleError(res, error);
        }
    };

    /** Pending badge for the sidebar. */
    const getPendingCount = async (req: Request, res: Response) => {
        try {
            return SuccessStatus(res, { count: await service.countPending(currentUser(req)) });
        } catch (error) {
            return handleError(res, error);
        }
    };

    const updateStatus = async (req: Request, res: Response) => {
        try {
            const alert = await service.updateStatus(
                currentUser(req),
                Number(req.params.id),
                req.body?.status as BranchAlertStatus
            );
            return SuccessStatus(res, alert);
        } catch (error) {
            return handleError(res, error);
        }
    };

    return { createAlert, getAlerts, getPendingCount, updateStatus };
};

/**
 * Maps the service's typed errors onto HTTP statuses: FORBIDDEN → 403,
 * NOT_FOUND → 404, everything else in the union is a validation issue → 400.
 */
const handleError = (res: Response, error: unknown) => {
    if (error instanceof AlertError) {
        switch (error.code) {
            case "FORBIDDEN":
                return ForbiddenStatus(res, error.message);
            case "NOT_FOUND":
                return NotFoundStatus(res, error.message);
            default:
                return BadRequestStatus(res, error.message);
        }
    }
    throw error;
};
