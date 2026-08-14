import { describe, expect, it } from "vitest";
import { getSafeReturnTo } from "./_core/oauth";
import { decodeOAuthState, encodeOAuthState } from "../shared/const";

describe("OAuth admin return path", () => {
  it("preserves the local admin return path in a signed-in flow", () => {
    const state = encodeOAuthState({ redirectUri: "https://example.com/api/oauth/callback", nonce: "nonce", returnTo: "/admin" });
    expect(getSafeReturnTo(decodeOAuthState(state).returnTo)).toBe("/admin");
  });

  it("rejects unsafe external redirect paths", () => {
    expect(getSafeReturnTo("https://example.com")).toBe("/");
    expect(getSafeReturnTo("//example.com")).toBe("/");
  });
});
