import { Router } from "express";
import { AlertController } from "./alert.controller.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";

const router = Router();
const controller = AlertController();

// Branch admins report from their own branch (branch comes from the account).
router.post("/", requireAuth, controller.createAlert); // {branch_admin}
// Main admin inbox across branches, or a branch admin's own history.
router.get("/", requireAuth, controller.getAlerts); // {admin, branch_admin}
router.get("/pending-count", requireAuth, controller.getPendingCount); // badge count {admin, branch_admin}
// Only the main office can acknowledge/resolve what a branch reported.
router.patch("/:id/status", requireAuth, requireRole("admin"), controller.updateStatus); // {admin}

export default router;
