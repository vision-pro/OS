import express, { type Express, type Request, type Response } from "express";
import { sdk } from "./_core/sdk";
import { saveMediaAsset } from "./db";
import { storagePut } from "./storage";

export const MB = 1024 * 1024;
export const MAX_VIDEO_UPLOAD_BYTES = 500 * MB;
export const MAX_STANDARD_UPLOAD_BYTES = 50 * MB;

function safeFileName(fileName: string) {
  const cleaned = fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
  return cleaned.slice(-140) || "media-file";
}

function resolveKind(mimeType: string): "image" | "video" | "document" | "other" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.includes("pdf") || mimeType.includes("document")) return "document";
  return "other";
}

export function getUploadLimit(mimeType: string) {
  return mimeType.startsWith("video/") ? MAX_VIDEO_UPLOAD_BYTES : MAX_STANDARD_UPLOAD_BYTES;
}

export function validateMediaUpload(mimeType: string, sizeBytes: number) {
  const maxBytes = getUploadLimit(mimeType);
  return { valid: sizeBytes > 0 && sizeBytes <= maxBytes, maxBytes };
}

export function registerMediaUploadRoute(app: Express) {
  app.post(
    "/api/media/upload",
    express.raw({ type: () => true, limit: MAX_VIDEO_UPLOAD_BYTES }),
    async (req: Request, res: Response) => {
      try {
        const user = await sdk.authenticateRequest(req).catch(() => null);
        if (!user || user.role !== "admin") return res.status(403).json({ error: "لا تملك صلاحية رفع الوسائط." });

        const fileName = typeof req.query.fileName === "string" ? req.query.fileName : "";
        const mimeType = typeof req.query.mimeType === "string" ? req.query.mimeType : req.headers["content-type"] || "application/octet-stream";
        const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
        const { valid, maxBytes } = validateMediaUpload(mimeType, buffer.length);
        if (!fileName || !valid) {
          return res.status(413).json({ error: `حجم الملف يجب أن يكون بين 1 بايت و${Math.round(maxBytes / MB)} ميجابايت.` });
        }

        const safeName = safeFileName(fileName);
        const { key, url } = await storagePut(`vision-production/media/${Date.now()}-${safeName}`, buffer, mimeType);
        const stored = await saveMediaAsset({
          storageKey: key,
          url,
          originalName: fileName.slice(0, 255),
          mimeType,
          sizeBytes: buffer.length,
          kind: resolveKind(mimeType),
          altAr: null,
          altEn: null,
          createdById: user.id,
        });
        return res.status(201).json({ ...stored, url, storageKey: key, originalName: fileName, mimeType, sizeBytes: buffer.length });
      } catch (error) {
        console.error("[Media Upload] Failed:", error);
        return res.status(500).json({ error: "تعذر رفع الملف الآن. حاول مرة أخرى." });
      }
    },
  );
}
