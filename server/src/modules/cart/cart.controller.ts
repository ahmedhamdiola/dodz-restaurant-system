import { Request, Response } from "express";
import { AuthRequest } from "../auth/auth.middleware.js";
import {
    BadRequestStatus,
    ConflictStatus,
    CreateStatus,
    NotFoundStatus,
    SuccessStatus,
    UnauthorizedStatus,
} from "../../utils/response.js";
import { normalizePhone } from "../../utils/phone.js";
import { CartService, hashGuestToken } from "./cart.service.js";
import {
    CartError,
    CartIdentity,
    GUEST_TOKEN_REGEX,
    MAX_QUANTITY,
} from "./cart.types.js";

const service = CartService();

const parsePositiveInt = (value: unknown): number | undefined => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : undefined;
};

const parseQuantity = (value: unknown): number | undefined => {
    const quantity = Number(value);
    return Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_QUANTITY ? quantity : undefined;
};

interface ResolvedIdentity {
    identity: CartIdentity | null;
    invalidToken: boolean;
    missing: boolean;
}

// Identity precedence: authenticated user > guest token. An identity is optional
// for GET /cart (anonymous visitors see an empty cart) but required to mutate.
const resolveIdentity = (req: Request): ResolvedIdentity => {
    const user = (req as AuthRequest).user;
    if (user) {
        return { identity: { kind: "user", userId: user.id }, invalidToken: false, missing: false };
    }
    const raw = req.headers["x-guest-token"];
    if (typeof raw !== "string" || raw.trim() === "") {
        return { identity: null, invalidToken: false, missing: true };
    }
    const token = raw.trim();
    if (!GUEST_TOKEN_REGEX.test(token)) {
        return { identity: null, invalidToken: true, missing: false };
    }
    return { identity: { kind: "guest", guestHash: hashGuestToken(token) }, invalidToken: false, missing: false };
};

const mapCartError = (res: Response, error: CartError) => {
    switch (error.type) {
        case "UNAVAILABLE_PRODUCT":
            return ConflictStatus(res, error.message);
        case "CART_NOT_FOUND":
            return NotFoundStatus(res, error.message);
        default:
            return BadRequestStatus(res, error.message);
    }
};

const requireIdentity = (res: Response, resolved: ResolvedIdentity): CartIdentity | null => {
    if (resolved.invalidToken) {
        BadRequestStatus(res, "Invalid guest token");
        return null;
    }
    if (resolved.missing) {
        BadRequestStatus(res, "A guest token or account is required");
        return null;
    }
    return resolved.identity;
};

export const CartController = () => {
    const getCart = async (req: Request, res: Response) => {
        const { identity } = resolveIdentity(req);
        try {
            const cart = await service.getCart(identity);
            return SuccessStatus(res, cart);
        } catch (error) {
            if (error instanceof CartError) return mapCartError(res, error);
            throw error;
        }
    };

    const addItem = async (req: Request, res: Response) => {
        const resolved = resolveIdentity(req);
        const identity = requireIdentity(res, resolved);
        if (identity === null) return;

        const productID = parsePositiveInt(req.body?.productID);
        const quantity = parseQuantity(req.body?.quantity ?? 1);
        if (productID === undefined || quantity === undefined) {
            return BadRequestStatus(res, "Invalid product or quantity");
        }

        try {
            const cart = await service.addItem(identity, productID, quantity);
            return CreateStatus(res, cart);
        } catch (error) {
            if (error instanceof CartError) return mapCartError(res, error);
            throw error;
        }
    };

    const setItemQuantity = async (req: Request, res: Response) => {
        const resolved = resolveIdentity(req);
        const identity = requireIdentity(res, resolved);
        if (identity === null) return;

        const productID = parsePositiveInt(req.params.productID);
        const quantity = parseQuantity(req.body?.quantity);
        if (productID === undefined || quantity === undefined) {
            return BadRequestStatus(res, "Invalid product or quantity (1-99)");
        }

        try {
            const cart = await service.setItemQuantity(identity, productID, quantity);
            return SuccessStatus(res, cart);
        } catch (error) {
            if (error instanceof CartError) return mapCartError(res, error);
            throw error;
        }
    };

    const removeItem = async (req: Request, res: Response) => {
        const resolved = resolveIdentity(req);
        const identity = requireIdentity(res, resolved);
        if (identity === null) return;

        const productID = parsePositiveInt(req.params.productID);
        if (productID === undefined) {
            return BadRequestStatus(res, "Invalid product");
        }

        try {
            const cart = await service.removeItem(identity, productID);
            return SuccessStatus(res, cart);
        } catch (error) {
            if (error instanceof CartError) return mapCartError(res, error);
            throw error;
        }
    };

    const clearCart = async (req: Request, res: Response) => {
        const resolved = resolveIdentity(req);
        const identity = requireIdentity(res, resolved);
        if (identity === null) return;

        try {
            const cart = await service.clearCart(identity);
            return SuccessStatus(res, cart);
        } catch (error) {
            if (error instanceof CartError) return mapCartError(res, error);
            throw error;
        }
    };

    const mergeGuestCart = async (req: Request, res: Response) => {
        const user = (req as AuthRequest).user;
        if (!user) {
            return UnauthorizedStatus(res, "Authentication required");
        }

        const rawToken = typeof req.body?.guestToken === "string" ? req.body.guestToken.trim() : "";
        if (!GUEST_TOKEN_REGEX.test(rawToken)) {
            return BadRequestStatus(res, "Invalid guest token");
        }

        try {
            const cart = await service.mergeGuestCart(user.id, hashGuestToken(rawToken));
            return SuccessStatus(res, cart);
        } catch (error) {
            if (error instanceof CartError) return mapCartError(res, error);
            throw error;
        }
    };

    const checkout = async (req: Request, res: Response) => {
        const resolved = resolveIdentity(req);
        const user = (req as AuthRequest).user;

        // Authenticated users default the order details to their account.
        let customerName = typeof req.body?.customerName === "string" ? req.body.customerName.trim() : "";
        let customerPhone: string | undefined;

        if (req.body?.customerPhone !== undefined && req.body.customerPhone !== null && req.body.customerPhone !== "") {
            const normalized = normalizePhone(req.body.customerPhone);
            if (normalized === null) {
                return BadRequestStatus(res, "Customer phone must be a valid Egyptian mobile number");
            }
            customerPhone = normalized;
        }

        if (user) {
            const account = await service.getAccountForUser(user.id);
            if (account) {
                if (!customerName) customerName = account.name;
                if (customerPhone === undefined && account.phone) customerPhone = account.phone;
            }
        }

        const branchID = parsePositiveInt(req.body?.branchID);
        if (branchID === undefined) {
            return BadRequestStatus(res, "Invalid branch");
        }
        if (!customerName) {
            return BadRequestStatus(res, "Customer name is required");
        }

        let idempotencyKey: string | undefined;
        if (req.body?.idempotencyKey !== undefined && req.body.idempotencyKey !== null && req.body.idempotencyKey !== "") {
            if (typeof req.body.idempotencyKey !== "string" || req.body.idempotencyKey.length > 64) {
                return BadRequestStatus(res, "Invalid idempotency key");
            }
            idempotencyKey = req.body.idempotencyKey.trim();
        }

        const identity = requireIdentity(res, resolved);
        if (identity === null) return;

        try {
            const result = await service.checkout(identity, {
                branchID,
                customerName,
                customerPhone,
                idempotencyKey,
            });
            return CreateStatus(res, result.order);
        } catch (error) {
            if (error instanceof CartError) return mapCartError(res, error);
            throw error;
        }
    };

    return {
        getCart,
        addItem,
        setItemQuantity,
        removeItem,
        clearCart,
        mergeGuestCart,
        checkout,
    };
};