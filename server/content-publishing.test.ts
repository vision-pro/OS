import { describe, expect, it } from "vitest";
import { isPubliclyPublished, publicationUpdate } from "./content-publishing";

describe("content publishing", () => {
  it("maps every public content type to the exact field read by the public site", () => {
    expect(publicationUpdate("projects", true)).toMatchObject({ status: "published" });
    expect(publicationUpdate("projects", true)).toHaveProperty("publishedAt");
    expect(publicationUpdate("projects", false)).toEqual({ status: "draft" });
    expect(publicationUpdate("pages", true)).toEqual({ status: "published" });
    expect(publicationUpdate("pages", false)).toEqual({ status: "draft" });
    expect(publicationUpdate("achievements", true)).toEqual({ isPublished: true });
    expect(publicationUpdate("achievements", false)).toEqual({ isPublished: false });
    expect(publicationUpdate("testimonials", true)).toEqual({ isPublished: true });
    expect(publicationUpdate("testimonials", false)).toEqual({ isPublished: false });
    expect(publicationUpdate("faqs", true)).toEqual({ isPublished: true });
    expect(publicationUpdate("faqs", false)).toEqual({ isPublished: false });
    expect(publicationUpdate("categories", true)).toEqual({ isActive: true });
    expect(publicationUpdate("categories", false)).toEqual({ isActive: false });
    expect(publicationUpdate("services", true)).toEqual({ isActive: true });
    expect(publicationUpdate("services", false)).toEqual({ isActive: false });
    expect(publicationUpdate("clients", false)).toEqual({ isActive: false });
    expect(publicationUpdate("clients", true)).toEqual({ isActive: true });
    expect(publicationUpdate("partners", true)).toEqual({ isActive: true });
    expect(publicationUpdate("partners", false)).toEqual({ isActive: false });
  });

  it("reports visibility using the same publication fields", () => {
    expect(isPubliclyPublished("projects", { status: "published" })).toBe(true);
    expect(isPubliclyPublished("projects", { status: "draft" })).toBe(false);
    expect(isPubliclyPublished("pages", { status: "published" })).toBe(true);
    expect(isPubliclyPublished("achievements", { isPublished: true })).toBe(true);
    expect(isPubliclyPublished("testimonials", { isPublished: false })).toBe(false);
    expect(isPubliclyPublished("faqs", { isPublished: true })).toBe(true);
    expect(isPubliclyPublished("categories", { isActive: true })).toBe(true);
    expect(isPubliclyPublished("services", { isActive: false })).toBe(false);
    expect(isPubliclyPublished("clients", { isActive: true })).toBe(true);
    expect(isPubliclyPublished("clients", { isActive: false })).toBe(false);
    expect(isPubliclyPublished("partners", { isActive: true })).toBe(true);
  });
});
