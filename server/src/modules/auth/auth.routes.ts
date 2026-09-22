import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";

const router = Router();
const controller = AuthController();

router.post("/signup", controller.signup); // register a password-based customer account {all}
router.post("/login", controller.login); // exchange email + password for a JWT {all}
router.get("/me", requireAuth, controller.me); // current authenticated user {auth}

export default router;