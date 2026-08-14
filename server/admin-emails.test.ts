import { describe, expect, it } from "vitest";
import { isConfiguredAdminEmail } from "./db";

describe("admin email configuration", () => {
  it("exposes the configured administrator email to the server environment", () => {
    const emails = (process.env.ADMIN_EMAILS ?? "").split(",").map(value => value.trim().toLowerCase());
    expect(emails).toContain("qumraproduction.nj@gmail.com");
  });

  it("recognizes the configured Google account as an administrator", () => {
    expect(isConfiguredAdminEmail("QUMRAPRODUCTION.NJ@gmail.com")).toBe(true);
    expect(isConfiguredAdminEmail("other@example.com")).toBe(false);
  });
});
