import { Router } from "express";
import { UploadController } from "./upload.controller.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";

const router = Router();
const controller = UploadController();

router.post("/", requireAuth, requireRole("admin"), controller.uploadImage); // image upload {admin}

export default router;