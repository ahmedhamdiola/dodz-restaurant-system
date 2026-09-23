import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";

const router = Router();
const controller = AuthController();

// Tight limiter on credential endpoints to slow down brute force / credential stuffing.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    // The integration suite (NODE_ENV=test) hammers /signup and /login far more
    // than 10 times per 15 minutes; the limiter is verified separately.
    skip: () => process.env.NODE_ENV === "test",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ success: false, message: "Too many attempts, please try again later" }),
});

router.post("/signup", authLimiter, controller.signup); // register a password-based customer account {all}
router.post("/login", authLimiter, controller.login); // exchange email + password for a JWT {all}
router.get("/me", requireAuth, controller.me); // current authenticated user {auth}

export default router;