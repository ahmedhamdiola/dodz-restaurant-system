import type { Response } from "express";
import { UploadService } from "../modules/upload/upload.service.js";
import { BadRequestStatus, InternalServerErrorStatus } from "./response.js";

const isImageDataUrl = (value: string): boolean => {
    const commaIndex = value.indexOf(",");
    if (commaIndex === -1 || !/^data:image\/[a-z0-9.+-]+;base64$/i.test(value.slice(0, commaIndex))) {
        return false;
    }

    const bytes = Buffer.from(value.slice(commaIndex + 1), "base64");
    if (bytes.length < 4) {
        return false;
    }

    return (
        (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
        (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) ||
        (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) ||
        (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46)
    );
};

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

export type ImageResolution =
    | { ok: true; url: string }
    | { ok: false; reason: "invalid" | "upload_failed" };

export const isImageDataUrlOrUrl = (value: string) => isImageDataUrl(value) || isHttpUrl(value);

export const resolveImage = async (image: string): Promise<ImageResolution> => {
    if (isHttpUrl(image)) {
        return { ok: true, url: image };
    }
    if (!isImageDataUrl(image)) {
        return { ok: false, reason: "invalid" };
    }

    const result = await UploadService().uploadImage(image);
    if (!result) {
        return { ok: false, reason: "upload_failed" };
    }

    return { ok: true, url: result.url };
};

export const resolveImageOrRespond = async (
    image: unknown,
    res: Response,
    label = "image"
): Promise<string | null> => {
    if (typeof image !== "string") {
        BadRequestStatus(res, `Invalid ${label}`);
        return null;
    }

    const resolution = await resolveImage(image);
    if (!resolution.ok) {
        if (resolution.reason === "invalid") {
            BadRequestStatus(res, `Invalid ${label}`);
        } else {
            InternalServerErrorStatus(res, "Image upload to Cloudinary failed");
        }
        return null;
    }

    return resolution.url;
};