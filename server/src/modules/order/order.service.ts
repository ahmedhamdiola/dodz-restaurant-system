import { BranchRepository } from "../branch/branch.repository.js";
import { OrderRepository } from "./order.repository.js";
import { OrderFilters, OrderInput, OrderStatus, ORDER_STATUSES, canTransitionTo } from "./order.types.js";

export const OrderService = () => {
    const orderRepository = OrderRepository();
    const branchRepository = BranchRepository();

    const getAllOrders = async (filters: OrderFilters) => {
        return orderRepository.getAllOrders(filters);
    };

    const getOrderByID = async (id: number) => {
        if (!id || id <= 0) {
            return null;
        }
        return orderRepository.getOrderByID(id);
    };

    const getOrderStats = async (branchID?: number) => {
        if (branchID !== undefined && (!branchID || branchID <= 0)) {
            return null;
        }
        if (branchID !== undefined && !(await branchRepository.getBranchByID(branchID))) {
            return null;
        }
        return orderRepository.getOrderStats(branchID);
    };

    const getOrdersCountByBranch = async () => {
        return orderRepository.getOrdersCountByBranch();
    };

    const createOrder = async (order: OrderInput) => {
        if (!order.customerName?.trim() || !Array.isArray(order.items) || order.items.length === 0) {
            return null;
        }
        if (order.items.some((item) => !item.productID || !item.quantity || item.quantity <= 0)) {
            return null;
        }
        if (!(await branchRepository.getBranchByID(order.branchID))) {
            return null;
        }

        return orderRepository.createOrder(order);
    };

    const updateOrderStatus = async (id: number, status: OrderStatus) => {
        if (!id || id <= 0 || !ORDER_STATUSES.includes(status)) {
            return null;
        }
        const existing = await orderRepository.getOrderByID(id);
        if (existing === null) {
            return null;
        }
        if (!canTransitionTo(existing.status, status)) {
            return null;
        }
        return orderRepository.updateOrderStatus(id, status);
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