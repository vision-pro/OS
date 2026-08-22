import express, { type Express, type Request, type Response } from "express";
import { appendFile, mkdir, readFile, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { sdk } from "./_core/sdk";
import { saveMediaAsset } from "./db";
import { storagePut } from "./storage";

export const MB = 1024 * 1024;
export const MAX_VIDEO_UPLOAD_BYTES = 500 * MB;
export const MAX_STANDARD_UPLOAD_BYTES = 50 * MB;
export const UPLOAD_CHUNK_BYTES = 8 * MB;
export const ALLOWED_MEDIA_MIME_TYPES = new Set([
  "video/mp4", "video/webm", "video/quicktime",
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
  "application/pdf",
]);

type ChunkUploadSession = {
  id: string;
  userId: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  receivedBytes: number;
  nextChunkIndex: number;
  tempPath: string;
  createdAt: number;
};

const chunkUploadSessions = new Map<string, ChunkUploadSession>();
const TEMP_UPLOAD_DIR = join(tmpdir(), "vision-production-media-uploads");

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
  const validType = ALLOWED_MEDIA_MIME_TYPES.has(mimeType);
  return { valid: validType && sizeBytes > 0 && sizeBytes <= maxBytes, validType, maxBytes };
}

async function saveBufferedMedia(userId: number, fileName: string, mimeType: string, buffer: Buffer) {
  const { key, url } = await storagePut(`vision-production/media/${Date.now()}-${safeFileName(fileName)}`, buffer, mimeType);
  const stored = await saveMediaAsset({ storageKey: key, url, originalName: fileName.slice(0, 255), mimeType, sizeBytes: buffer.length, kind: resolveKind(mimeType), altAr: null, altEn: null, createdById: userId });
  return { ...stored, url, storageKey: key, originalName: fileName, mimeType, sizeBytes: buffer.length };
}

async function removeChunkSession(session: ChunkUploadSession) {
  chunkUploadSessions.delete(session.id);
  await rm(session.tempPath, { force: true }).catch(() => undefined);
}

export function registerMediaUploadRoute(app: Express) {
  const requireAdmin = async (req: Request, res: Response) => {
    const user = await sdk.authenticateRequest(req).catch(() => null);
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "لا تملك صلاحية إدارة الوسائط." });
      return null;
    }
    return user;
  };

  app.post("/api/media/chunked/start", express.json({ limit: "64kb" }), async (req: Request, res: Response) => {
    try {
      const user = await requireAdmin(req, res);
      if (!user) return;
      const { fileName, mimeType, sizeBytes } = req.body ?? {};
      if (typeof fileName !== "string" || typeof mimeType !== "string" || !Number.isSafeInteger(sizeBytes)) return res.status(400).json({ error: "بيانات الملف غير مكتملة." });
      const { valid, validType, maxBytes } = validateMediaUpload(mimeType, sizeBytes);
      if (!validType) return res.status(415).json({ error: "صيغة الملف غير مدعومة." });
      if (!valid) return res.status(413).json({ error: `حجم الملف يجب أن يكون بين 1 بايت و${Math.round(maxBytes / MB)} ميجابايت.` });
      await mkdir(TEMP_UPLOAD_DIR, { recursive: true });
      const id = randomUUID();
      const session: ChunkUploadSession = { id, userId: user.id, fileName, mimeType, sizeBytes, receivedBytes: 0, nextChunkIndex: 0, tempPath: join(TEMP_UPLOAD_DIR, `${id}.part`), createdAt: Date.now() };
      chunkUploadSessions.set(id, session);
      console.info("[Chunked Media Upload] Started", { id, fileName, mimeType, sizeBytes, userId: user.id });
      return res.status(201).json({ uploadId: id, chunkBytes: UPLOAD_CHUNK_BYTES });
    } catch (error) {
      console.error("[Chunked Media Upload] Start failed", { message: error instanceof Error ? error.message : String(error) });
      return res.status(500).json({ error: "تعذر تجهيز رفع الفيديو." });
    }
  });

  app.post("/api/media/chunked/:uploadId", express.raw({ type: () => true, limit: UPLOAD_CHUNK_BYTES + MB }), async (req: Request, res: Response) => {
    try {
      const user = await requireAdmin(req, res);
      if (!user) return;
      const session = chunkUploadSessions.get(req.params.uploadId);
      const chunkIndex = Number(req.query.index);
      const chunk = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
      if (!session || session.userId !== user.id || !Number.isInteger(chunkIndex) || chunkIndex !== session.nextChunkIndex) return res.status(409).json({ error: "جلسة الرفع غير صالحة. ابدأ الرفع من جديد." });
      if (!chunk.length || chunk.length > UPLOAD_CHUNK_BYTES || session.receivedBytes + chunk.length > session.sizeBytes) return res.status(413).json({ error: "حجم جزء الرفع غير صحيح." });
      await appendFile(session.tempPath, chunk);
      session.receivedBytes += chunk.length;
      session.nextChunkIndex += 1;
      return res.status(200).json({ receivedBytes: session.receivedBytes, sizeBytes: session.sizeBytes });
    } catch (error) {
      console.error("[Chunked Media Upload] Chunk failed", { message: error instanceof Error ? error.message : String(error) });
      return res.status(500).json({ error: "تعذر رفع جزء من الفيديو. حاول من جديد." });
    }
  });

  app.post("/api/media/chunked/:uploadId/complete", express.json({ limit: "8kb" }), async (req: Request, res: Response) => {
    let session: ChunkUploadSession | undefined;
    let shouldCleanup = false;
    try {
      const user = await requireAdmin(req, res);
      if (!user) return;
      session = chunkUploadSessions.get(req.params.uploadId);
      if (!session || session.userId !== user.id) return res.status(409).json({ error: "جلسة الرفع غير صالحة. ابدأ الرفع من جديد." });
      if (session.receivedBytes !== session.sizeBytes) return res.status(409).json({ error: "لم تكتمل جميع أجزاء الفيديو." });
      const buffer = await readFile(session.tempPath);
      const stored = await saveBufferedMedia(user.id, session.fileName, session.mimeType, buffer);
      shouldCleanup = true;
      console.info("[Chunked Media Upload] Completed", { id: session.id, mediaId: stored.id, sizeBytes: session.sizeBytes });
      return res.status(201).json(stored);
    } catch (error) {
      console.error("[Chunked Media Upload] Complete failed", { message: error instanceof Error ? error.message : String(error) });
      return res.status(500).json({ error: "اكتمل إرسال الفيديو لكن تعذر حفظه في المكتبة. حاول لاحقاً." });
    } finally {
      if (session && shouldCleanup) await removeChunkSession(session);
    }
  });

  app.post("/api/media/upload", express.raw({ type: () => true, limit: MAX_VIDEO_UPLOAD_BYTES }), async (req: Request, res: Response) => {
    try {
      const user = await requireAdmin(req, res);
      if (!user) return;
      const fileName = typeof req.query.fileName === "string" ? req.query.fileName : "";
      const mimeType = typeof req.query.mimeType === "string" ? req.query.mimeType : req.headers["content-type"] || "application/octet-stream";
      const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
      console.info("[Media Upload] Received", { fileName, mimeType, sizeBytes: buffer.length, userId: user.id });
      const { valid, validType, maxBytes } = validateMediaUpload(mimeType, buffer.length);
      if (!validType) return res.status(415).json({ error: "صيغة الملف غير مدعومة. الصيغ المسموحة: MP4 وWebM وMOV وJPG وPNG وWebP وSVG وPDF." });
      if (!fileName || !valid) return res.status(413).json({ error: `حجم الملف يجب أن يكون بين 1 بايت و${Math.round(maxBytes / MB)} ميجابايت.` });
      const stored = await saveBufferedMedia(user.id, fileName, mimeType, buffer);
      console.info("[Media Upload] Stored", { id: stored.id, sizeBytes: buffer.length, mimeType });
      return res.status(201).json(stored);
    } catch (error) {
      console.error("[Media Upload] Failed", { message: error instanceof Error ? error.message : String(error) });
      return res.status(500).json({ error: "تعذر رفع الملف الآن. حاول مرة أخرى." });
    }
  });
}
