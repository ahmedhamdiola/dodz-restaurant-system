import { Router } from "express";
import { UploadController } from "./upload.controller.js";

const router = Router();
const controller = UploadController();

router.post("/", controller.uploadImage);

export default router;