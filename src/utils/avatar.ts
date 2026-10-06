export const MAX_AVATAR_SIZE_BYTES = 7 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_DIMENSION = 1024;

/** Validates, downsizes and converts to JPEG so the server always gets a small, readable file. */
export async function prepareAvatar(file: File): Promise<File> {
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Please choose a JPG, PNG or WebP image.");
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
        throw new Error("Profile photo must be 7MB or smaller.");
    }

    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        throw new Error("We couldn't read that image. Try a different one.");
    }

    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.fillStyle = "#ffffff"; // avoid black backgrounds for transparent PNGs
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

const firstErrorMessage = (value: unknown): string | null => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
        for (const item of value) {
            const message = firstErrorMessage(item);
            if (message) return message;
        }
        return null;
    }
    if (value && typeof value === "object") {
        for (const entry of Object.values(value as Record<string, unknown>)) {
            const message = firstErrorMessage(entry);
            if (message) return message;
        }
    }
    return null;
};

export const getApiErrorMessage = (
    error: any,
    fallback = "Something went wrong. Please try again."
): string => {
    if (!error?.response) return "Network error. Check your connection and try again.";
    if (error.response.status === 413) return "That file is too large for the server. Try a smaller photo.";

    const data = error.response.data;
    if (typeof data === "string") return data || fallback;

    if (data && typeof data === "object") {
        if (typeof data.message === "string" && data.message) return data.message;
        if (typeof data.detail === "string" && data.detail) return data.detail;
        if (typeof data.error === "string" && data.error) return data.error;

        for (const key of ["non_field_errors", "errors", "field_errors"]) {
            const nested = (data as Record<string, unknown>)[key];
            const msg = firstErrorMessage(nested);
            if (msg) return msg;
        }

        for (const [field, value] of Object.entries(data as Record<string, unknown>)) {
            const msg = firstErrorMessage(value);
            if (!msg) continue;
            const normalizedField = field.replace(/_/g, " ");
            if (field === "detail" || field === "message" || field === "error") continue;
            return `${normalizedField}: ${msg}`;
        }
    }

    return fallback;
};