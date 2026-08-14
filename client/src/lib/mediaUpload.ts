export const MB = 1024 * 1024;
export const MAX_VIDEO_UPLOAD_BYTES = 500 * MB;
export const MAX_STANDARD_UPLOAD_BYTES = 50 * MB;

export function getUploadLimit(file: File) {
  return file.type.startsWith("video/") ? MAX_VIDEO_UPLOAD_BYTES : MAX_STANDARD_UPLOAD_BYTES;
}

export function formatBytes(bytes: number) {
  return `${Math.round(bytes / MB)} ميجابايت`;
}

type UploadOptions = {
  onProgress?: (percent: number) => void;
};

export async function uploadMediaFile(file: File, options: UploadOptions = {}) {
  return await new Promise<Record<string, unknown>>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const query = new URLSearchParams({
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
    });

    request.open("POST", `/api/media/upload?${query.toString()}`);
    request.withCredentials = true;
    request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    request.upload.onprogress = event => {
      if (event.lengthComputable) options.onProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };
    request.onerror = () => reject(new Error("تعذر الاتصال بخدمة الرفع."));
    request.onload = () => {
      let body: { error?: string } = {};
      try { body = JSON.parse(request.responseText || "{}"); } catch { /* Keep a generic error below. */ }
      if (request.status >= 200 && request.status < 300) resolve(body);
      else reject(new Error(body.error || "تعذر رفع الملف الآن."));
    };
    request.send(file);
  });
}
