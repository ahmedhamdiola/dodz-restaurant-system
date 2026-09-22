import { useRef, useState, type ChangeEvent } from "react";
import { ArrowUpTrayIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { api, unwrap } from "../../../../lib/api";
import { useToast } from "../../../../components/toast/context";

const inputClass =
    "w-full rounded-lg border border-border bg-primary px-3.5 py-2.5 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

interface UploadResponseData {
    url: string;
    publicId: string;
}

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
}

const readAsDataUrl = (file: File) =>
    new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });

const ImageUploader = ({ value, onChange, label = "Image" }: ImageUploaderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const toast = useToast();

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setUploadError("Please choose a valid image file");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setUploadError("Image must be 8MB or smaller");
            return;
        }

        const dataUrl = await readAsDataUrl(file);
        if (!dataUrl) {
            setUploadError("Could not read the selected file");
            return;
        }

        setUploading(true);
        setUploadError("");
        try {
            const uploaded = await unwrap<UploadResponseData>(
                api.post("/uploads", { image: dataUrl })
            );
            onChange(uploaded.url);
            toast.success("Image uploaded");
        } catch {
            setUploadError("Upload failed. Try again or paste a URL below.");
            toast.error("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {label && (
                <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                    {label}
                </span>
            )}

            <div
                aria-busy={uploading}
                className={`flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted transition-opacity ${
                    uploading ? "opacity-60" : ""
                }`}
            >
                {value ? (
                    <img src={value} alt="Image preview" className="h-full w-full object-cover" />
                ) : (
                    <PhotoIcon className="h-8 w-8 text-muted-foreground/60" />
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                aria-label="Choose an image file"
                className="hidden"
                tabIndex={-1}
            />

            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    aria-label={uploading ? "Uploading image" : "Upload image"}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {uploading ? (
                        "Uploading…"
                    ) : (
                        <>
                            <ArrowUpTrayIcon className="h-4 w-4" />
                            Upload image
                        </>
                    )}
                </button>
                <input
                    type="text"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="https://…"
                    dir="ltr"
                    disabled={uploading}
                    aria-label="Or paste an image URL"
                    className={inputClass}
                />
                {uploadError && (
                    <span className="text-xs font-medium text-red-500">{uploadError}</span>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;