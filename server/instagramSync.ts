import type { Express, Request, Response } from "express";
import { getInstagramSyncConfigByTaskUid, syncInstagramVideos } from "./db";
import { sdk } from "./_core/sdk";

export function registerInstagramSyncSchedule(app: Express) {
  app.post("/api/scheduled/instagram-sync", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: "cron-only" });
      }

      const config = await getInstagramSyncConfigByTaskUid(user.taskUid);
      if (!config || !config.isScheduleEnabled) {
        return res.json({ ok: true, skipped: "orphan-or-paused" });
      }

      const result = await syncInstagramVideos(config.id);
      return res.json({ ok: true, ...result, taskUid: user.taskUid });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  });
}
