export const MB = 1024 * 1024;
export const MAX_VIDEO_UPLOAD_BYTES = 500 * MB;
export const MAX_STANDARD_UPLOAD_BYTES = 50 * MB;
export const ALLOWED_MEDIA_MIME_TYPES = new Set([
  "video/mp4", "video/webm", "video/quicktime",
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
  "application/pdf",
]);

export function getUploadLimit(file: File) {
  return file.type.startsWith("video/") ? MAX_VIDEO_UPLOAD_BYTES : MAX_STANDARD_UPLOAD_BYTES;
}

export function isAllowedMediaFile(file: File) {
  return ALLOWED_MEDIA_MIME_TYPES.has(file.type);
}

export function formatBytes(bytes: number) {
  return `${Math.round(bytes / MB)} ميجابايت`;
}

type UploadOptions = {
  onProgress?: (percent: number) => void;
};

export async function uploadMediaFile(file: File, options: UploadOptions = {}) {
  const presignResponse = await fetch("/api/media/presign", {
    method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, mimeType: file.type || "application/octet-stream", sizeBytes: file.size }),
  });
  const presign = await presignResponse.json().catch(() => ({})) as { error?: string; uploadUrl?: string; key?: string; url?: string };
  if (!presignResponse.ok || !presign.uploadUrl || !presign.key || !presign.url) throw new Error(presign.error || "تعذر تجهيز رفع الملف الآن.");
  const uploadUrl = presign.uploadUrl;
  const storageKey = presign.key;
  const storageUrl = presign.url;
  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadUrl);
    request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    request.upload.onprogress = event => {
      if (event.lengthComputable) options.onProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };
    request.onerror = () => reject(new Error("تعذر الاتصال بتخزين الوسائط."));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error("تعذر رفع الملف إلى التخزين."));
    };
    request.send(file);
  });
  const finalizeResponse = await fetch("/api/media/finalize", {
    method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storageKey, url: storageUrl, fileName: file.name, mimeType: file.type || "application/octet-stream", sizeBytes: file.size }),
  });
  const finalized = await finalizeResponse.json().catch(() => ({})) as Record<string, unknown> & { error?: string };
  if (!finalizeResponse.ok) throw new Error(finalized.error || "تم رفع الملف لكن تعذر تسجيله في المكتبة.");
  return finalized;
}
