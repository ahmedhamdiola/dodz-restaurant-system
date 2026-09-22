import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const required = [
    ["CLOUDINARY_CLOUD_NAME", process.env.CLOUDINARY_CLOUD_NAME],
    ["CLOUDINARY_API_KEY", process.env.CLOUDINARY_API_KEY],
    ["CLOUDINARY_API_SECRET", process.env.CLOUDINARY_API_SECRET],
] as const;

const missing = required.filter(([, value]) => !value).map(([key]) => key);

if (missing.length > 0) {
    throw new Error(
        `Cloudinary is not configured: missing ${missing.join(", ")}. Add them to server/.env (see server/.env.example).`
    );
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;