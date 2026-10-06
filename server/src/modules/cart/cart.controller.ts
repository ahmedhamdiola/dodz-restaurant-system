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

import { MAX_LINKED_TOTAL, RequestedQuantity } from "../product/product.options.types.js";
import { CartService, hashGuestToken } from "./cart.service.js";
import { OrderType } from "../order/order.totals.js";
import { COUPON_CODE_MAX_LENGTH, IDEMPOTENCY_KEY_REGEX } from "./cart.types.js";
import {
    CartError,
    CartIdentity,
    GUEST_TOKEN_REGEX,
    MAX_OPTION_VALUE_IDS,
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

/**
 * Option value ids submitted by the storefront. Shape-only validation: whether
 * the ids belong to the product, and what they cost, is decided server-side
 * inside the add-to-cart transaction.
 */
const parseOptionValueIDs = (value: unknown): number[] | undefined => {
    if (value === undefined || value === null) {
        return [];
    }
    if (!Array.isArray(value) || value.length > MAX_OPTION_VALUE_IDS) {
        return undefined;
    }
    const ids: number[] = [];
    for (const entry of value) {
        const id = Number(entry);
        if (!Number.isInteger(id) || id <= 0) {
            return undefined;
        }
        ids.push(id);
    }
    return ids;
};

/**
 * Counts for "quantity" option groups, e.g. [{ valueId: 812, quantity: 6 }].
 * Additive and optional, so clients that predate counted groups keep working by
 * simply omitting it.
 */
const parseOptionQuantities = (value: unknown): RequestedQuantity[] | undefined => {
    if (value === undefined || value === null) {
        return [];
    }
    if (!Array.isArray(value) || value.length > MAX_OPTION_VALUE_IDS) {
        return undefined;
    }
    const quantities: RequestedQuantity[] = [];
    for (const entry of value) {
        if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
            return undefined;
        }
        const { valueId, quantity } = entry as Record<string, unknown>;
        const id = Number(valueId);
        const count = Number(quantity);
        if (!Number.isInteger(id) || id <= 0) {
            return undefined;
        }
        // Capped rather than merely non-negative: an unbounded count multiplied by
        // a price_delta overflows NUMERIC(10,2) on the order row and 500s.
        if (!Number.isInteger(count) || count < 0 || count > MAX_LINKED_TOTAL) {
            return undefined;
        }
        quantities.push({ valueId: id, quantity: count });
    }
    return quantities;
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
    // The client asked for a selection the server does not accept, and one it
    // accepts structurally but which is no longer orderable.
    const payload = {
        type: error.type,
        ...(error.unavailableProductIds ? { unavailableProductIds: error.unavailableProductIds } : {}),
        ...(error.unavailableCartItemIds ? { unavailableCartItemIds: error.unavailableCartItemIds } : {}),
    };
    switch (error.type) {
        case "UNAVAILABLE_PRODUCT":
        case "OPTION_UNAVAILABLE":
            return ConflictStatus(res, error.message, payload);
        case "CART_NOT_FOUND":
            return NotFoundStatus(res, error.message, payload);
        case "INVALID_COUPON":
            return ConflictStatus(res, error.message, payload);
        default:
            return BadRequestStatus(res, error.message, payload);
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
        const optionValueIDs = parseOptionValueIDs(req.body?.optionValueIDs);
        const optionQuantities = parseOptionQuantities(req.body?.optionQuantities);
        if (productID === undefined || quantity === undefined) {
            return BadRequestStatus(res, "Invalid product or quantity");
        }
        if (optionValueIDs === undefined || optionQuantities === undefined) {
            return BadRequestStatus(res, "Invalid option selections");
        }

        try {
            const cart = await service.addItem(identity, productID, quantity, optionValueIDs, optionQuantities);
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

        const cartItemID = parsePositiveInt(req.params.cartItemId);
        const quantity = parseQuantity(req.body?.quantity);
        if (cartItemID === undefined || quantity === undefined) {
            return BadRequestStatus(res, "Invalid cart item or quantity (1-99)");
        }

        try {
            const cart = await service.setItemQuantity(identity, cartItemID, quantity);
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

        const cartItemID = parsePositiveInt(req.params.cartItemId);
        if (cartItemID === undefined) {
            return BadRequestStatus(res, "Invalid cart item");
        }

        try {
            const cart = await service.removeItem(identity, cartItemID);
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
            // The replay lookup is keyed only by this string, so a guessable key
            // would let anyone read back someone else's order (name, phone, items).
            // The web client sends crypto.randomUUID(); this is the same entropy
            // floor, not a client-trusted format.
            if (typeof req.body.idempotencyKey !== "string" || !IDEMPOTENCY_KEY_REGEX.test(req.body.idempotencyKey.trim())) {
                return BadRequestStatus(res, "Invalid idempotency key");
            }
            idempotencyKey = req.body.idempotencyKey.trim();
        }

        const orderTypeRaw = req.body?.orderType;
        if (orderTypeRaw !== "Delivery" && orderTypeRaw !== "Pickup") {
            return BadRequestStatus(res, "Order type must be Delivery or Pickup");
        }
        const orderType: OrderType = orderTypeRaw;

        let deliveryAddress: string | undefined;
        let deliveryLat: number | undefined;
        let deliveryLng: number | undefined;
        if (orderType === "Delivery") {
            const addr = typeof req.body?.deliveryAddress === "string" ? req.body.deliveryAddress.trim() : "";
            if (!addr) {
                return BadRequestStatus(res, "A delivery address is required");
            }
            deliveryAddress = addr;
            const lat = Number(req.body?.deliveryLat);
            const lng = Number(req.body?.deliveryLng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                return BadRequestStatus(res, "Valid delivery coordinates are required");
            }
            deliveryLat = lat;
            deliveryLng = lng;
        }

        let couponCode: string | undefined;
        if (req.body?.couponCode !== undefined && req.body.couponCode !== null && req.body.couponCode !== "") {
            // Only a shape check here. Whether the code can actually be spent is
            // decided in the checkout transaction, against the re-priced cart.
            if (typeof req.body.couponCode !== "string" || req.body.couponCode.trim().length > COUPON_CODE_MAX_LENGTH) {
                return BadRequestStatus(res, "Invalid coupon code");
            }
            couponCode = req.body.couponCode.trim();
        }

        const identity = requireIdentity(res, resolved);
        if (identity === null) return;

        try {
            const result = await service.checkout(identity, {
                branchID,
                customerName,
                customerPhone,
                orderType,
                deliveryAddress,
                deliveryLat,
                deliveryLng,
                couponCode,
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