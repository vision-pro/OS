import { describe, expect, it } from "vitest";

const SUPABASE_URL = "https://hpzrsuygkbkbxfihgbyu.supabase.co";

describe("Supabase service secret", () => {
  it("can perform a minimal authenticated read from the Vision project", async () => {
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(secret).toMatch(/^sb_secret_/);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/services?select=id&limit=1`, {
      headers: { apikey: secret!, Authorization: `Bearer ${secret}` },
    });

    expect(response.ok).toBe(true);
  }, 20_000);
});
