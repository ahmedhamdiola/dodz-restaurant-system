import cloudinary from "../../config/cloudinary.js";
import type { UploadResult } from "./upload.types.js";

const FOLDER = "dodz";
const MAX_WIDTH = 1280;

const optimizedOptions = {
    fetch_format: "auto",
    quality: "auto",
    width: MAX_WIDTH,
    crop: "limit",
    secure: true,
} as const;

const optimizedUrl = (publicId: string) => cloudinary.url(publicId, optimizedOptions);

export const UploadService = () => {
    const uploadImage = async (image: string): Promise<UploadResult | null> => {
        try {
            const result = await cloudinary.uploader.upload(image, { folder: FOLDER });
            return {
                url: optimizedUrl(result.public_id),
                publicId: result.public_id,
            };
        } catch {
            return null;
        }
    };

    return { uploadImage };
};