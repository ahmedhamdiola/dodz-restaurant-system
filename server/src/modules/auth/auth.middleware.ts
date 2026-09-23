import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedStatus } from "../../utils/response.js";
import { AuthUser, UserRole } from "./auth.types.js";

// Request augmented with the verified JWT subject (set by requireAuth)
export interface AuthRequest extends Request {
    user?: AuthUser;
}

const extractBearerToken = (authorization: string | undefined): string | null => {
    if (!authorization || !authorization.startsWith("Bearer ")) {
        return null;
    }
    const token = authorization.slice("Bearer ".length).trim();
    return token.length > 0 ? token : null;
};

// Verifies `Authorization: Bearer <token>` and attaches req.user = { id, role }
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
        return UnauthorizedStatus(res, "Authentication required");
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload & { sub?: string; role?: UserRole };
        if (!payload.sub) {
            return UnauthorizedStatus(res, "Authentication required");
        }

        (req as AuthRequest).user = {
            id: Number(payload.sub),
            role: payload.role ?? "customer",
        };
        next();
    } catch {
        return UnauthorizedStatus(res, "Authentication required");
    }
};

// Like requireAuth but never rejects: attaches req.user when a valid bearer token is
// present and ignores it (or an invalid one) otherwise. Used by endpoints that serve
// both authenticated users and anonymous guests (e.g. /cart).
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
        return next();
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload & { sub?: string; role?: UserRole };
        if (payload.sub) {
            (req as AuthRequest).user = {
                id: Number(payload.sub),
                role: payload.role ?? "customer",
            };
        }
    } catch {
        // Invalid/expired token: treat the request as anonymous.
    }
    return next();
};

// Restricts a route to a single role (e.g. requireRole("admin")); must run after requireAuth
export const requireRole = (role: UserRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as AuthRequest).user;
        if (!user) {
            return UnauthorizedStatus(res, "Authentication required");
        }
        if (user.role !== role) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        next();
    };
};