export const MB = 1024 * 1024;
export const MAX_VIDEO_UPLOAD_BYTES = 500 * MB;
export const MAX_STANDARD_UPLOAD_BYTES = 50 * MB;
export const CHUNKED_UPLOAD_THRESHOLD_BYTES = 45 * MB;
export const CHUNKED_UPLOAD_BYTES = 8 * MB;
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

export function shouldUseChunkedUpload(file: File) {
  return file.size > CHUNKED_UPLOAD_THRESHOLD_BYTES;
}

type UploadOptions = { onProgress?: (percent: number) => void };
type UploadResponse = Record<string, unknown> & { error?: string };

async function readJson(response: Response) {
  return await response.json().catch(() => ({})) as UploadResponse;
}

export async function uploadMediaFile(file: File, options: UploadOptions = {}) {
  if (shouldUseChunkedUpload(file)) return uploadChunkedMediaFile(file, options);
  return await new Promise<Record<string, unknown>>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const query = new URLSearchParams({ fileName: file.name, mimeType: file.type || "application/octet-stream" });
    request.open("POST", `/api/media/upload?${query.toString()}`);
    request.withCredentials = true;
    request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    request.upload.onprogress = event => { if (event.lengthComputable) options.onProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100))); };
    request.onerror = () => reject(new Error("تعذر الاتصال بخدمة الرفع."));
    request.onload = () => {
      let body: UploadResponse = {};
      try { body = JSON.parse(request.responseText || "{}"); } catch { /* Use the generic error below. */ }
      if (request.status >= 200 && request.status < 300) resolve(body);
      else reject(new Error(body.error || "تعذر رفع الملف الآن."));
    };
    request.send(file);
  });
}

async function uploadChunk(chunk: Blob, uploadId: string, index: number, alreadyUploaded: number, total: number, options: UploadOptions) {
  return await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `/api/media/chunked/${encodeURIComponent(uploadId)}?index=${index}`);
    request.withCredentials = true;
    request.setRequestHeader("Content-Type", "application/octet-stream");
    request.upload.onprogress = event => { if (event.lengthComputable) options.onProgress?.(Math.min(99, Math.round(((alreadyUploaded + event.loaded) / total) * 100))); };
    request.onerror = () => reject(new Error("تعذر إرسال جزء من الفيديو."));
    request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error("تعذر حفظ جزء من الفيديو. ابدأ الرفع من جديد."));
    request.send(chunk);
  });
}

export async function uploadChunkedMediaFile(file: File, options: UploadOptions = {}) {
  const start = await fetch("/api/media/chunked/start", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, mimeType: file.type || "application/octet-stream", sizeBytes: file.size }) });
  const started = await readJson(start) as UploadResponse & { uploadId?: string; chunkBytes?: number };
  if (!start.ok || !started.uploadId) throw new Error(started.error || "تعذر تجهيز رفع الفيديو.");
  const chunkBytes = started.chunkBytes || CHUNKED_UPLOAD_BYTES;
  let uploaded = 0;
  for (let index = 0; uploaded < file.size; index += 1) {
    const chunk = file.slice(uploaded, Math.min(uploaded + chunkBytes, file.size));
    await uploadChunk(chunk, started.uploadId, index, uploaded, file.size, options);
    uploaded += chunk.size;
  }
  const complete = await fetch(`/api/media/chunked/${encodeURIComponent(started.uploadId)}/complete`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: "{}" });
  const stored = await readJson(complete);
  if (!complete.ok) throw new Error(stored.error || "تعذر إتمام حفظ الفيديو.");
  options.onProgress?.(100);
  return stored;
}
