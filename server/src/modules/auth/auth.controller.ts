import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { AuthRequest } from "./auth.middleware.js";
import { BadRequestStatus, ConflictStatus, CreateStatus, NotFoundStatus, SuccessStatus, UnauthorizedStatus } from "../../utils/response.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const service = AuthService();

export const AuthController = () => {
    const signup = async (req: Request, res: Response) => {
        const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body.password === "string" ? req.body.password : "";
        const phone = req.body.phone ? String(req.body.phone).trim() : null;

        if (!name) {
            return BadRequestStatus(res, "Name is required");
        }
        if (!EMAIL_REGEX.test(email)) {
            return BadRequestStatus(res, "Invalid email format");
        }
        if (password.length < 8) {
            return BadRequestStatus(res, "Password must be at least 8 characters");
        }
        if (!/^01[0-9]{9}$/.test(phone ?? "")) {
            return BadRequestStatus(res, "Phone number is required");
        }

        const result = await service.signup({ name, email, phone, password });
        if (result.status === "conflict") {
            return ConflictStatus(res, "Email or phone already in use");
        }

        return CreateStatus(res, { token: result.token, user: result.user });
    };

    const login = async (req: Request, res: Response) => {
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body.password === "string" ? req.body.password : "";

        if (!email || !password) {
            return BadRequestStatus(res, "Email and password are required");
        }

        const result = await service.login({ email, password });
        if (result.status === "invalid_credentials" || result.status === "inactive") {
            // Keep the same message for every failure so we never leak whether an
            // email exists, is disabled, or just has a wrong password.
            return UnauthorizedStatus(res, "Invalid email or password");
        }

        return SuccessStatus(res, { token: result.token, user: result.user });
    };

    const me = async (req: Request, res: Response) => {
        const user = (req as AuthRequest).user;
        if (!user) {
            return UnauthorizedStatus(res, "Authentication required");
        }

        const result = await service.me(user.id);
        if (!result) {
            return NotFoundStatus(res, "User not found");
        }

        return SuccessStatus(res, result);
    };

    return { signup, login, me };
};