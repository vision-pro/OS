import type { Express, Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { saveMediaAsset } from "./db";
import { storagePut } from "./storage";

const MAX_UPLOAD_BYTES = 45 * 1024 * 1024;

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

export function registerMediaUploadRoute(app: Express) {
  app.post("/api/media/upload", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req).catch(() => null);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "لا تملك صلاحية رفع الوسائط." });
      }
      const { fileName, mimeType, dataUrl, altAr, altEn } = req.body as Record<string, unknown>;
      if (typeof fileName !== "string" || typeof mimeType !== "string" || typeof dataUrl !== "string") {
        return res.status(400).json({ error: "بيانات الملف غير مكتملة." });
      }
      if (!/^data:[^;]+;base64,/.test(dataUrl)) {
        return res.status(400).json({ error: "صيغة الملف غير مدعومة." });
      }
      const buffer = Buffer.from(dataUrl.replace(/^data:[^;]+;base64,/, ""), "base64");
      if (!buffer.length || buffer.length > MAX_UPLOAD_BYTES) {
        return res.status(413).json({ error: "حجم الملف يجب أن يكون بين 1 بايت و45 ميغابايت." });
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
        altAr: typeof altAr === "string" ? altAr.slice(0, 300) : null,
        altEn: typeof altEn === "string" ? altEn.slice(0, 300) : null,
        createdById: user.id,
      });
      return res.status(201).json({ ...stored, url, storageKey: key, originalName: fileName, mimeType, sizeBytes: buffer.length });
    } catch (error) {
      console.error("[Media Upload] Failed:", error);
      return res.status(500).json({ error: "تعذر رفع الملف الآن. حاول مرة أخرى." });
    }
  });
}
