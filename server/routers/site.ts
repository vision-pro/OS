import { router, publicProcedure } from "../_core/trpc";
import { createBooking, createContactRequest, getPublicSiteData } from "../db";
import { z } from "zod";

const optionalText = z.string().trim().max(2000).optional();

export const siteRouter = router({
  data: publicProcedure.query(async () => getPublicSiteData()),
  createBooking: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(180),
        phone: z.string().trim().min(5).max(50),
        company: z.string().trim().max(180).optional(),
        serviceId: z.number().int().positive().optional(),
        projectType: z.string().trim().max(180).optional(),
        requestedDate: z.string().trim().max(80).optional(),
        budgetRange: z.string().trim().max(100).optional(),
        message: optionalText,
        preferredLanguage: z.enum(["ar", "en"]),
      }),
    )
    .mutation(({ input }) => createBooking(input)),
  createContact: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(180),
        phone: z.string().trim().max(50).optional(),
        email: z.string().trim().email().max(320).optional().or(z.literal("")),
        subject: z.string().trim().max(240).optional(),
        message: z.string().trim().min(8).max(6000),
        preferredLanguage: z.enum(["ar", "en"]),
      }),
    )
    .mutation(({ input }) => createContactRequest({ ...input, email: input.email || undefined })),
});
