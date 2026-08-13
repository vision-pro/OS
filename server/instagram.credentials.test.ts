import { describe, expect, it } from "vitest";

describe("Instagram Graph API credentials", () => {
  it("can validate the configured access token", async () => {
    const accessToken = process.env.INSTAGRAM_GRAPH_ACCESS_TOKEN;
    expect(accessToken, "INSTAGRAM_GRAPH_ACCESS_TOKEN must be configured").toBeTruthy();

    const url = new URL("https://graph.facebook.com/v23.0/me");
    url.searchParams.set("fields", "id,name");
    url.searchParams.set("access_token", accessToken!);

    const response = await fetch(url);
    const body = await response.json() as { id?: string; name?: string; error?: { message?: string } };

    expect(response.ok, body.error?.message ?? "Instagram Graph API request failed").toBe(true);
    expect(body.id).toBeTruthy();
  }, 20_000);

  it("can read the Instagram business account linked to the company page", async () => {
    const accessToken = process.env.INSTAGRAM_GRAPH_ACCESS_TOKEN;
    const url = new URL("https://graph.facebook.com/v23.0/830116313518371");
    url.searchParams.set("fields", "id,name,instagram_business_account{id,username}");
    url.searchParams.set("access_token", accessToken!);

    const response = await fetch(url);
    const body = await response.json() as {
      instagram_business_account?: { id?: string; username?: string };
      error?: { message?: string };
    };

    expect(response.ok, body.error?.message ?? "Could not read the company Facebook Page").toBe(true);
    expect(body.instagram_business_account?.id, "No Instagram business account is linked to the company page").toBeTruthy();
  }, 20_000);
});
