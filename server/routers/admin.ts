import { adminProcedure, router } from "../_core/trpc";
import {
  AdminEntity,
  deleteAdminEntity,
  getAdminOverview,
  listAdminEntity,
  listAdminUsers,
  listMedia,
  listRequests,
  listSiteSettings,
  saveAdminEntity,
  saveSiteSetting,
  updateRequestStatus,
  updateUserRole,
} from "../db";
import { z } from "zod";

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
      .mutation(({ input }) => saveAdminEntity(input.entity as AdminEntity, input.id, input.values)),
    remove: adminProcedure
      .input(z.object({ entity: entitySchema, id: z.number().int().positive() }))
      .mutation(({ input }) => deleteAdminEntity(input.entity as AdminEntity, input.id)),
  }),
  media: router({
    list: adminProcedure.query(async () => listMedia()),
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
});
