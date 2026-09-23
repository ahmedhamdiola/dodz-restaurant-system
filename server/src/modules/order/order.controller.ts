import type { Request, Response } from "express";
import { OrderService } from "./order.service.js";
import { OrderInput, OrderStatus, ORDER_STATUSES } from "./order.types.js";
import { AuthRequest } from "../auth/auth.middleware.js";
import {
    BadRequestStatus,
    CreateStatus,
    NotFoundStatus,
    SuccessStatus,
    UnauthorizedStatus,
} from "../../utils/response.js";
import { normalizePhone } from "../../utils/phone.js";

const service = OrderService();

const parseQueryId = (value: unknown): number | undefined => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : undefined;
};

export const OrderController = () => {
    const getAllOrders = async (req: Request, res: Response) => {
        const branchID = parseQueryId(req.query.branchId);
        if (req.query.branchId !== undefined && branchID === undefined) {
            return BadRequestStatus(res, "Invalid branchId filter");
        }

        const status = typeof req.query.status === "string" ? (req.query.status as OrderStatus) : undefined;
        if (status !== undefined && !ORDER_STATUSES.includes(status)) {
            return BadRequestStatus(res, "Invalid status filter");
        }

        let customerPhone: string | undefined;
        if (req.query.customerPhone !== undefined) {
            if (typeof req.query.customerPhone !== "string" || !req.query.customerPhone.trim()) {
                return BadRequestStatus(res, "Invalid customerPhone filter");
            }
            customerPhone = req.query.customerPhone.trim();
        }

        const orders = await service.getAllOrders({ branchID, status, customerPhone });
        return SuccessStatus(res, orders);
    };

    const getMyOrders = async (req: Request, res: Response) => {
        const user = (req as AuthRequest).user;
        if (!user) {
            return UnauthorizedStatus(res, "Authentication required");
        }

        const orders = await service.getMyOrders(user.id);
        if (orders === null) {
            return NotFoundStatus(res, "User not found");
        }
        return SuccessStatus(res, orders);
    };

    const getOrderByID = async (req: Request, res: Response) => {
        const order = await service.getOrderByID(Number(req.params.id));
        if (order === null) {
            return NotFoundStatus(res, "Order not found");
        }
        return SuccessStatus(res, order);
    };

    const getOrderStats = async (req: Request, res: Response) => {
        const branchID = parseQueryId(req.query.branchId);
        const stats = await service.getOrderStats(branchID);
        if (stats === null) {
            return BadRequestStatus(res, "Invalid branch");
        }
        return SuccessStatus(res, stats);
    };

    const getOrdersCountByBranch = async (req: Request, res: Response) => {
        const counts = await service.getOrdersCountByBranch();
        return SuccessStatus(res, counts);
    };

    const createOrder = async (req: Request, res: Response) => {
        const branchID = parseQueryId(req.body.branchID);
        if (branchID === undefined) {
            return BadRequestStatus(res, "Invalid branch");
        }

        const customerName = typeof req.body.customerName === "string" ? req.body.customerName.trim() : "";
        if (!customerName) {
            return BadRequestStatus(res, "Customer name is required");
        }

        let customerPhone: string | undefined;
        if (req.body.customerPhone !== undefined && req.body.customerPhone !== null && req.body.customerPhone !== "") {
            const normalized = normalizePhone(req.body.customerPhone);
            if (normalized === null) {
                return BadRequestStatus(res, "Customer phone must be a valid Egyptian mobile number");
            }
            customerPhone = normalized;
        }

        if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
            return BadRequestStatus(res, "Order items are required");
        }
        for (const item of req.body.items) {
            const productID = parseQueryId(item?.productID);
            const quantity = Number(item?.quantity);
            if (productID === undefined || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
                return BadRequestStatus(res, "Invalid order item");
            }
        }

        const order: OrderInput = {
            branchID,
            customerName,
            customerPhone,
            items: req.body.items,
        };

        const result = await service.createOrder(order);
        if (result === null) {
            return BadRequestStatus(res, "Invalid order data");
        }
        return CreateStatus(res, result);
    };

    const updateOrderStatus = async (req: Request, res: Response) => {
        const result = await service.updateOrderStatus(Number(req.params.id), req.body.status as OrderStatus);
        if (result === null) {
            return BadRequestStatus(res, "Invalid order id or status");
        }
        return SuccessStatus(res, result);
    };

    return {
        getAllOrders,
        getMyOrders,
        getOrderByID,
        getOrderStats,
        getOrdersCountByBranch,
        createOrder,
        updateOrderStatus,
    };
};