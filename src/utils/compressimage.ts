/**
 * Client-side image compression (no dependencies).
 * Reads the file, downscales it to fit maxDimension, and re-encodes as JPEG/WebP,
 * lowering quality step by step until it is under maxSizeMB.
 *
 * onProgress receives 0-100.
 */
export type CompressOptions = {
    maxDimension?: number; // longest side in px
    maxSizeMB?: number; // target size ceiling
    initialQuality?: number; // 0-1
    minQuality?: number; // 0-1
    onProgress?: (percent: number) => void;
};

const readFile = (file: File, onProgress: (p: number) => void) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onprogress = (e) => {
            if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
        };
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = src;
    });

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
    new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
            type,
            quality
        );
    });

// Let the browser paint so the progress bar visibly updates between heavy steps.
const tick = () => new Promise<void>((r) => setTimeout(r, 0));

export async function compressImage(
    file: File,
    {
        maxDimension = 1600,
        maxSizeMB = 1,
        initialQuality = 0.85,
        minQuality = 0.5,
        onProgress,
    }: CompressOptions = {}
): Promise<File> {
    const report = (p: number) => onProgress?.(Math.min(100, Math.max(0, Math.round(p))));
    report(0);

    // Skip things canvas would break or enlarge (GIF animation, SVG) and non-images.
    if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
        report(100);
        return file;
    }

    // 1) Read (0-40%)
    const dataUrl = await readFile(file, (p) => report(p * 0.4));
    report(40);

    // 2) Decode (40-55%)
    const img = await loadImage(dataUrl);
    report(55);
    await tick();

    // 3) Resize
    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        report(100);
        return file;
    }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    report(65);
    await tick();

    // 4) Encode, stepping quality down until small enough (65-100%)
    const outType = file.type === 'image/png' || file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
    const maxBytes = maxSizeMB * 1024 * 1024;
    const steps = 5;
    let quality = initialQuality;
    let blob = await canvasToBlob(canvas, outType, quality);

    for (let i = 1; i <= steps && blob.size > maxBytes && quality > minQuality; i++) {
        quality = Math.max(minQuality, quality - 0.1);
        report(65 + (i / steps) * 30);
        await tick();
        blob = await canvasToBlob(canvas, outType, quality);
    }

    report(100);

    // Never return something bigger than the original.
    if (blob.size >= file.size && scale === 1) return file;

    const ext = outType === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.${ext}`, { type: outType, lastModified: Date.now() });
}

export const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};