export const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export function validateImageFile(file: File, maxBytes = 15 * 1024 * 1024) {
  if (!allowedImageTypes.includes(file.type as (typeof allowedImageTypes)[number])) return "النوع غير مدعوم؛ استخدم PNG أو JPG أو WEBP.";
  if (file.size > maxBytes) return `حجم ${file.name} يتجاوز الحد المسموح.`;
  if (file.size === 0) return "الملف فارغ.";
  return null;
}

export async function loadBitmap(file: Blob) {
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("canvas-export-failed"))), type, quality);
  });
}

export function calculateDimensions(originalWidth: number, originalHeight: number, wantedWidth: number, wantedHeight: number, preserveRatio: boolean) {
  if (!wantedWidth && !wantedHeight) return { width: originalWidth, height: originalHeight };
  if (!preserveRatio && wantedWidth && wantedHeight) return { width: wantedWidth, height: wantedHeight };
  const widthRatio = wantedWidth ? wantedWidth / originalWidth : Infinity;
  const heightRatio = wantedHeight ? wantedHeight / originalHeight : Infinity;
  const ratio = Math.min(widthRatio, heightRatio);
  return {
    width: Math.max(1, Math.round(originalWidth * ratio)),
    height: Math.max(1, Math.round(originalHeight * ratio)),
  };
}

export function extensionForType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}
