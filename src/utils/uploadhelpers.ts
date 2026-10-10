// utils/uploadHelpers.ts
// Image-file safety helpers + a single place that turns ANY error into a
// readable message for toasts. Use getErrorMessages(error) in every onError.

export const MAX_IMAGE_MB = 25; // reject anything bigger before compressing
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const EXT_TO_TYPE: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
};

const extOf = (name: string) => (name.split('.').pop() || '').toLowerCase();

/** Some Android browsers give an empty `file.type`; infer it from the extension. */
export const guessType = (file: File) => file.type || EXT_TO_TYPE[extOf(file.name)] || '';

export const isHeic = (file: File) => /hei[cf]/i.test(guessType(file)) || /^hei[cf]$/.test(extOf(file.name));

/** Quick checks before we even try to compress. Returns a message or null. */
export function validateImageFile(file: File): string | null {
    if (!file.size) {
        return 'The selected image is empty (0 bytes). If it is stored in Google Photos/iCloud, download it to your phone first, then pick it again.';
    }
    if (isHeic(file)) {
        return 'HEIC/HEIF photos are not supported. Pick a JPG or PNG, or set your camera to "Most Compatible" (iPhone: Settings > Camera > Formats).';
    }
    const type = guessType(file);
    if (type && !type.startsWith('image/')) {
        return 'That file is not an image. Please choose a JPG, PNG or WebP photo.';
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        return `That image is too large (over ${MAX_IMAGE_MB}MB). Choose a smaller photo.`;
    }
    return null;
}

/** Can the original (uncompressed) file be safely uploaded as-is? */
export const canUploadOriginal = (file: File) => ALLOWED_IMAGE_TYPES.includes(guessType(file));

/**
 * Copies the file fully into memory. On Android (and with cloud-backed photos)
 * the original File handle can become invalid after selection, which makes the
 * later upload fail with a bare "Network Error". An in-memory copy can't.
 */
export async function toStableFile(file: File): Promise<File> {
    const buffer = await file.arrayBuffer(); // throws NotReadableError if unreadable
    if (!buffer.byteLength) {
        const err = new Error('empty file');
        err.name = 'EmptyFileError';
        throw err;
    }
    const type = guessType(file) || 'image/jpeg';
    const ext = Object.keys(EXT_TO_TYPE).find((k) => EXT_TO_TYPE[k] === type) || 'jpg';
    const base = (file.name || 'image').replace(/\.[^.]+$/, '');
    const name = `${base}.${ext === 'jpeg' ? 'jpg' : ext}`;
    return new File([buffer], name, { type, lastModified: Date.now() });
}

/** Last-moment check right before submit. */
export async function isFileReadable(file: File): Promise<boolean> {
    try {
        const head = await file.slice(0, 1024).arrayBuffer();
        return head.byteLength > 0;
    } catch {
        return false;
    }
}

// ─── Error message building ────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
    title: 'Event name',
    description: 'Description',
    location: 'Location',
    online: 'Online',
    onsite: 'In-person',
    start_date: 'Start date',
    end_date: 'End date',
    require_approval: 'Require approval',
    ticket_price: 'Ticket price',
    tickets: 'Tickets',
    capacity: 'Capacity',
    image: 'Cover image',
    name: 'Name',
    amount: 'Price',
    non_field_errors: '',
    detail: '',
    message: '',
    error: '',
    errors: '',
};

const STATUS_MESSAGES: Record<number, string> = {
    400: 'The server rejected the request. Please check your details and try again.',
    401: 'Your session has expired. Please log in again.',
    403: "You don't have permission to do this with this account.",
    404: 'The server could not find what it needed (404). Please refresh the page and try again.',
    405: 'This action is not allowed by the server (405).',
    408: 'The request took too long and timed out. Check your connection and try again.',
    409: 'This conflicts with an existing event. Change the details and try again.',
    413: 'The upload is too large for the server. Use a smaller cover image or ticket images and try again.',
    415: 'The server does not accept this file type. Use a JPG, PNG or WebP image.',
    422: 'Some details are invalid. Please review the form and try again.',
    429: 'Too many requests. Please wait a minute and try again.',
    500: 'The server hit an error (500). Please try again shortly. If it keeps happening, contact support.',
    502: 'The server is temporarily unreachable (502). Please try again in a moment.',
    503: 'The service is temporarily unavailable (503). Please try again in a moment.',
    504: 'The server took too long to respond (504). Your upload may be too big or your connection too slow.',
};

// Backend messages are shown EXACTLY as the server sent them (no rewording).
const friendly = (msg: string): string => msg.trim();

const stripHtml = (s: string) =>
    s
        .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const looksLikeHtml = (s: string) => /<\s*(!doctype|html|body|head)/i.test(s);

// List fields whose items are shown as "Ticket 1", "Module 2", ...
const ITEM_LABELS: Record<string, string> = { tickets: 'Ticket', course_content: 'Module' };

const labelFor = (path: string[], labels?: Record<string, string>): string => {
    const parts: string[] = [];
    path.forEach((seg, i) => {
        if (/^\d+$/.test(seg)) {
            const parent = path[i - 1];
            const itemLabel = ITEM_LABELS[parent];
            parts.push(itemLabel ? `${itemLabel} ${Number(seg) + 1}` : `#${Number(seg) + 1}`);
            // the list's own label would be redundant right before "Ticket N" / "Module N"
            if (itemLabel && parts.length >= 2) parts.splice(parts.length - 2, 1);
        } else {
            const label = labels?.[seg] ?? FIELD_LABELS[seg] ?? seg.replace(/_/g, ' ');
            if (label) parts.push(label);
        }
    });
    return parts.join(' > ');
};

/** Walks DRF-style error bodies (strings, arrays, nested objects, lists of objects). */
function flatten(value: unknown, path: string[] = [], labels?: Record<string, string>): string[] {
    if (value == null) return [];
    if (typeof value === 'string') {
        if (looksLikeHtml(value)) return [];
        const label = labelFor(path, labels);
        return [`${label ? label + ': ' : ''}${friendly(value)}`];
    }
    if (typeof value === 'number' || typeof value === 'boolean') return [];
    if (Array.isArray(value)) {
        const allStrings = value.every((v) => typeof v === 'string');
        if (allStrings) return value.flatMap((v) => flatten(v, path, labels));
        return value.flatMap((v, i) => flatten(v, [...path, String(i)], labels));
    }
    if (typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
            flatten(v, [...path, k], labels)
        );
    }
    return [];
}

const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

/**
 * Turns ANY thrown thing (axios error, DOMException, JS error, plain string)
 * into a list of human-readable messages. First item is the best one for a toast.
 */
export function getErrorMessages(
    error: any,
    fallback = 'Something went wrong. Please try again.',
    labels?: Record<string, string> // optional per-page field labels, e.g. { title: 'Product title' }
): string[] {
    if (typeof error === 'string') return [error];

    // 1) Server replied with an error status
    if (error?.response) {
        const { status, data } = error.response;
        const statusText = error.response.statusText ? ` ${error.response.statusText}` : '';
        let body = unique(flatten(data, [], labels));

        // Non-JSON replies (nginx/proxy/Django HTML error pages): show their text
        if (body.length === 0 && typeof data === 'string' && data.trim()) {
            const text = looksLikeHtml(data) ? stripHtml(data) : data.trim();
            if (text) body = [text.length > 300 ? `${text.slice(0, 300)}…` : text];
        }

        // Prefix the first line with the HTTP status so the source is obvious
        if (body.length > 0) {
            return [`[${status}${statusText}] ${body[0]}`, ...body.slice(1)];
        }

        // Server sent an empty body
        const statusMsg = STATUS_MESSAGES[status];
        return [`[${status}${statusText}] ${statusMsg ?? 'The server returned an error with no details.'}`];
    }

    // 2) Request was sent but no response came back (network layer)
    if (error?.isAxiosError || error?.request) {
        const code = error?.code as string | undefined;
        const msg = String(error?.message ?? '');
        if (code === 'ERR_CANCELED') return ['The upload was cancelled.'];
        if (code === 'ECONNABORTED' || code === 'ETIMEDOUT' || /timeout/i.test(msg)) {
            return [
                'The upload timed out. Your connection may be too slow for these images. Try Wi-Fi or use a smaller image.',
            ];
        }
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            return ["You're offline. Reconnect to the internet and try again."];
        }
        return [
            'Network error: the upload did not reach the server. Possible causes: weak or dropped connection, the image file became unreadable (common on Android when the photo comes from Google Photos or cloud storage), or the server is down. Re-select the image, check your connection and try again.',
        ];
    }

    // 3) Errors thrown locally (file reading, canvas, dates, ...)
    const name = String(error?.name ?? '');
    const msg = String(error?.message ?? '');
    switch (name) {
        case 'NotReadableError':
            return [
                'The image could not be read. If it lives in Google Photos/iCloud, download it to your phone first, then pick it again.',
            ];
        case 'NotFoundError':
            return ['The selected file no longer exists. Please pick the image again.'];
        case 'SecurityError':
            return ['Your browser blocked access to this file. Pick the image again.'];
        case 'QuotaExceededError':
            return ['Your phone ran out of memory while processing the image. Close other tabs/apps or use a smaller image.'];
        case 'AbortError':
            return ['Reading the image was interrupted. Please try again.'];
        case 'EncodingError':
        case 'EmptyFileError':
            return ['The image appears to be corrupted or empty. Choose a different photo.'];
        case 'RangeError':
            if (/invalid time value/i.test(msg)) {
                return ['One of the dates or times is invalid. Re-select the start and end date/time.'];
            }
            return ['The image or data is too large to process. Use a smaller image.'];
    }
    if (error instanceof TypeError && /failed to fetch|load failed|networkerror/i.test(msg)) {
        return ['Network error: could not reach the server. Check your connection and try again.'];
    }
    if (/out of memory|allocation/i.test(msg)) {
        return ['Your phone ran out of memory while processing the image. Use a smaller image.'];
    }
    if (msg && msg.length < 200) return [`Unexpected error: ${msg}`];
    return [fallback];
}

/** One-line version for addToast: first message + "(+N more)". */
export function getErrorMessage(error: any, fallback?: string, labels?: Record<string, string>): string {
    const list = getErrorMessages(error, fallback, labels);
    return list.join(' • ');
}