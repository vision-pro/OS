import { adminProcedure, router } from "../_core/trpc";
import {
  AdminEntity,
  deleteMediaAsset,
  deleteAdminEntity,
  getAdminOverview,
  listAdminEntity,
  listAdminUsers,
  getOrCreateInstagramSyncConfig,
  listInstagramVideos,
  listMedia,
  listRequests,
  listSiteSettings,
  saveAdminEntity,
  setAdminEntityPublication,
  syncAdminEntityToSupabase,
  saveSiteSetting,
  syncInstagramVideos,
  updateInstagramSchedule,
  updateInstagramVideoStatus,
  updateRequestStatus,
  updateUserRole,
} from "../db";
import { z } from "zod";
import { parse as parseCookie } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import { createHeartbeatJob, updateHeartbeatJob } from "../_core/heartbeat";

const entitySchema = z.enum([
  "projects",
  "categories",
  "services",
  "achievements",
  "clients",
  "partners",
  "testimonials",
  "faqs",
  "pages",
]);

export const adminRouter = router({
  overview: adminProcedure.query(async () => getAdminOverview()),
  content: router({
    list: adminProcedure.input(entitySchema).query(({ input }) => listAdminEntity(input as AdminEntity)),
    save: adminProcedure
      .input(
        z.object({
          entity: entitySchema,
          id: z.number().int().positive().optional(),
          values: z.record(z.string(), z.unknown()),
        }),
      )
      .mutation(async ({ input }) => {
        const result = await saveAdminEntity(input.entity as AdminEntity, input.id, input.values);
        try {
          await syncAdminEntityToSupabase(input.entity as AdminEntity, result.id);
          return { ...result, syncWarning: null };
        } catch (error) {
          console.error("[Admin Content] Saved locally but public sync failed", error);
          return { ...result, syncWarning: "تم حفظ التعديل، لكن مزامنة الواجهة العامة ستُعاد تلقائياً عند النشر التالي." };
        }
      }),
    setPublication: adminProcedure
      .input(z.object({ entity: entitySchema, id: z.number().int().positive(), published: z.boolean() }))
      .mutation(async ({ input }) => {
        const result = await setAdminEntityPublication(input.entity as AdminEntity, input.id, input.published);
        try {
          await syncAdminEntityToSupabase(input.entity as AdminEntity, input.id);
          return { ...result, syncWarning: null };
        } catch (error) {
          console.error("[Admin Content] Publication updated locally but public sync failed", error);
          return { ...result, syncWarning: "تم تحديث حالة النشر، لكن مزامنة الواجهة العامة ستُعاد تلقائياً عند النشر التالي." };
        }
      }),
    remove: adminProcedure
      .input(z.object({ entity: entitySchema, id: z.number().int().positive() }))
      .mutation(({ input }) => deleteAdminEntity(input.entity as AdminEntity, input.id)),
  }),
  media: router({
    list: adminProcedure.query(async () => listMedia()),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteMediaAsset(input.id)),
  }),
  requests: router({
    list: adminProcedure.input(z.enum(["bookings", "contacts"])).query(({ input }) => listRequests(input)),
    updateStatus: adminProcedure
      .input(z.object({ kind: z.enum(["bookings", "contacts"]), id: z.number().int().positive(), status: z.string().min(1).max(30) }))
      .mutation(({ input }) => updateRequestStatus(input.kind, input.id, input.status)),
  }),
  users: router({
    list: adminProcedure.query(async () => listAdminUsers()),
    updateRole: adminProcedure
      .input(z.object({ id: z.number().int().positive(), role: z.enum(["admin", "user"]) }))
      .mutation(({ input }) => updateUserRole(input.id, input.role)),
  }),
  settings: router({
    list: adminProcedure.query(async () => listSiteSettings()),
    save: adminProcedure
      .input(z.object({ key: z.string().trim().min(1).max(120), value: z.record(z.string(), z.unknown()) }))
      .mutation(({ input, ctx }) => saveSiteSetting(input.key, input.value, ctx.user.id)),
  }),
  instagram: router({
    config: adminProcedure.query(() => getOrCreateInstagramSyncConfig()),
    videos: adminProcedure.query(() => listInstagramVideos()),
    syncNow: adminProcedure.mutation(() => syncInstagramVideos()),
    setVideoStatus: adminProcedure
      .input(z.object({ id: z.number().int().positive(), status: z.enum(["draft", "published", "archived"]) }))
      .mutation(({ input, ctx }) => updateInstagramVideoStatus(input.id, input.status, ctx.user.id)),
    setSchedule: adminProcedure
      .input(z.object({ enabled: z.boolean(), cronExpression: z.string().regex(/^(\S+\s+){5}\S+$/, "صيغة الجدولة يجب أن تحتوي ستة حقول") }))
      .mutation(async ({ input, ctx }) => {
        const config = await getOrCreateInstagramSyncConfig();
        const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
        if (!input.enabled && config.scheduleCronTaskUid) {
          await updateHeartbeatJob(config.scheduleCronTaskUid, { enable: false }, sessionToken);
          await updateInstagramSchedule(config.id, { isScheduleEnabled: false, cronExpression: input.cronExpression });
          return { enabled: false };
        }
        if (!input.enabled) {
          await updateInstagramSchedule(config.id, { isScheduleEnabled: false, cronExpression: input.cronExpression });
          return { enabled: false };
        }
        if (config.scheduleCronTaskUid) {
          await updateHeartbeatJob(config.scheduleCronTaskUid, { cron: input.cronExpression, enable: true }, sessionToken);
          await updateInstagramSchedule(config.id, { isScheduleEnabled: true, cronExpression: input.cronExpression });
          return { enabled: true };
        }
        const job = await createHeartbeatJob({
          name: "instagram-video-sync",
          cron: input.cronExpression,
          path: "/api/scheduled/instagram-sync",
          description: "Sync published Instagram videos to Ru'ya dashboard as drafts",
        }, sessionToken);
        await updateInstagramSchedule(config.id, { scheduleCronTaskUid: job.taskUid, isScheduleEnabled: true, cronExpression: input.cronExpression });
        return { enabled: true, nextExecutionAt: job.nextExecutionAt };
      }),
  }),
});
