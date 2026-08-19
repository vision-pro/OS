import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { services } from "../drizzle/schema";
import { getDb, syncAdminEntityToSupabase } from "./db";

const SUPABASE_URL = "https://hpzrsuygkbkbxfihgbyu.supabase.co";

describe("external publication sync", () => {
  it("synchronizes an existing service to the GitHub Pages data source", async () => {
    const db = await getDb();
    expect(db).toBeTruthy();
    const source = await db!.select().from(services).limit(1);
    expect(source[0]).toBeTruthy();

    await syncAdminEntityToSupabase("services", source[0]!.id);

    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/services?slug=eq.${encodeURIComponent(source[0]!.slug)}&select=slug,title_ar,is_active&limit=1`, {
      headers: { apikey: secret, Authorization: `Bearer ${secret}` },
    });
    const synced = await response.json() as Array<{ slug: string; title_ar: string; is_active: boolean }>;
    expect(response.ok).toBe(true);
    expect(synced[0]).toMatchObject({ slug: source[0]!.slug, title_ar: source[0]!.titleAr, is_active: source[0]!.isActive });
  }, 30_000);
});
