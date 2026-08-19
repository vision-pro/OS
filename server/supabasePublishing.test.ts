import { describe, expect, it } from "vitest";
import { toSupabasePayload } from "./supabasePublishing";

describe("Supabase publication payloads", () => {
  it("maps a published service to the external schema and resolves its cover media", async () => {
    const result = await toSupabasePayload("services", { slug: "film", titleAr: "فيلم", titleEn: "Film", isActive: true, coverMediaId: 7, sortOrder: 2 }, { resolveMediaId: async id => id ? "media-uuid" : null, resolveCategoryId: async () => null });
    expect(result).toMatchObject({ table: "services", conflict: "slug", payload: { slug: "film", title_ar: "فيلم", title_en: "Film", is_active: true, cover_media_id: "media-uuid", sort_order: 2 } });
  });

  it("maps a client without leaking MySQL identifiers into Supabase", async () => {
    const result = await toSupabasePayload("clients", { id: 19, nameAr: "رؤية", nameEn: "Vision", logoMediaId: 5, isActive: false, sortOrder: 1 }, { resolveMediaId: async () => "logo-uuid", resolveCategoryId: async () => null });
    expect(result).toMatchObject({ table: "clients", match: { name_ar: "رؤية" }, payload: { name_ar: "رؤية", logo_media_id: "logo-uuid", is_active: false } });
    expect((result as any).payload).not.toHaveProperty("id");
  });
});
