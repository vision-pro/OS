import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { services } from "../drizzle/schema";
import { getDb, getPublicSiteData } from "./db";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function adminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "publication-verifier",
      name: "Publication verifier",
      email: "qumraproduction.nj@gmail.com",
      loginMethod: "test",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin publication flow", () => {
  it("updates a real public result through the administrative publication procedure and restores the original state", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database is required for the publication integration test");

    const [service] = await db.select().from(services).where(eq(services.isActive, true)).limit(1);
    if (!service) throw new Error("An active service is required for the publication integration test");

    const caller = appRouter.createCaller(adminContext());
    try {
      await caller.admin.content.setPublication({ entity: "services", id: service.id, published: false });
      const hiddenData = await getPublicSiteData();
      expect(hiddenData?.services.some(item => item.id === service.id)).toBe(false);

      await caller.admin.content.setPublication({ entity: "services", id: service.id, published: true });
      const visibleData = await getPublicSiteData();
      expect(visibleData?.services.some(item => item.id === service.id)).toBe(true);
    } finally {
      await db.update(services).set({ isActive: service.isActive }).where(eq(services.id, service.id));
    }
  });
});
