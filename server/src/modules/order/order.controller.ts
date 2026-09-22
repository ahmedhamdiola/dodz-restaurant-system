import type { Request, Response } from "express";
import { OrderService } from "./order.service.js";
import { OrderInput, OrderStatus } from "./order.types.js";
import {
    BadRequestStatus,
    CreateStatus,
    NotFoundStatus,
    SuccessStatus,
} from "../../utils/response.js";

const service = OrderService();

const parseQueryId = (value: unknown): number | undefined => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : undefined;
};

export const OrderController = () => {
    const getAllOrders = async (req: Request, res: Response) => {
        const branchID = parseQueryId(req.query.branchId);
        const status = typeof req.query.status === "string" ? (req.query.status as OrderStatus) : undefined;
        const customerPhone =
            typeof req.query.customerPhone === "string" && req.query.customerPhone.trim().length > 0
                ? req.query.customerPhone.trim()
                : undefined;
        const orders = await service.getAllOrders({ branchID, status, customerPhone });
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
        const order: OrderInput = {
            branchID: Number(req.body.branchID),
            customerName: req.body.customerName,
            customerPhone: req.body.customerPhone,
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
        getOrderByID,
        getOrderStats,
        getOrdersCountByBranch,
        createOrder,
        updateOrderStatus,
    };
};