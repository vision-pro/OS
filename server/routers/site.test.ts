import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createBooking: vi.fn(),
  createContactRequest: vi.fn(),
}));

vi.mock("../db", () => ({
  createBooking: mocks.createBooking,
  createContactRequest: mocks.createContactRequest,
  getPublicSiteData: vi.fn(),
}));

import { siteRouter } from "./site";

const ctx = { user: null, req: {} as any, res: {} as any };

describe("site booking and contact procedures", () => {
  it("rejects a booking with an invalid short phone number before reaching the database", async () => {
    const caller = siteRouter.createCaller(ctx);

    await expect(
      caller.createBooking({
        name: "عميل",
        phone: "123",
        preferredLanguage: "ar",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(mocks.createBooking).not.toHaveBeenCalled();
  });

  it("saves a valid booking request with the selected language", async () => {
    mocks.createBooking.mockResolvedValueOnce({ id: 42 });
    const caller = siteRouter.createCaller(ctx);

    const result = await caller.createBooking({
      name: "شركة نموذجية",
      phone: "+9647700000000",
      projectType: "إعلان سينمائي",
      message: "نحتاج إلى تصور أولي لحملة تعريفية.",
      preferredLanguage: "ar",
    });

    expect(result).toEqual({ id: 42 });
    expect(mocks.createBooking).toHaveBeenCalledWith(expect.objectContaining({
      name: "شركة نموذجية",
      preferredLanguage: "ar",
    }));
  });

  it("requires a meaningful contact message", async () => {
    const caller = siteRouter.createCaller(ctx);

    await expect(
      caller.createContact({
        name: "عميل",
        message: "قصير",
        preferredLanguage: "ar",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(mocks.createContactRequest).not.toHaveBeenCalled();
  });
});
