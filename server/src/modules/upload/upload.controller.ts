import type { Request, Response } from "express";
import { UploadService } from "./upload.service.js";
import { BadRequestStatus, CreateStatus, InternalServerErrorStatus } from "../../utils/response.js";
import { isImageDataUrlOrUrl } from "../../utils/image.js";

const service = UploadService();

export const UploadController = () => {
    const uploadImage = async (req: Request, res: Response) => {
        const image: unknown = req.body?.image;
        if (typeof image !== "string" || !isImageDataUrlOrUrl(image)) {
            return BadRequestStatus(res, "A valid image (base64 data URL or http URL) is required");
        }

        const result = await service.uploadImage(image);
        if (result === null) {
            return InternalServerErrorStatus(res, "Image upload to Cloudinary failed");
        }

        return CreateStatus(res, result);
    };

    return { uploadImage };
};