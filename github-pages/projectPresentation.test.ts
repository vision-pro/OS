import { describe, expect, it } from "vitest";
import { isProjectVisibleInLocation, normalizeProjectDisplayLocation, projectHash, slugFromProjectHash } from "./projectPresentation.js";

describe("project presentation helpers", () => {
  it("يطبّق مكان الظهور المختار مع قيمة آمنة افتراضية", () => {
    expect(normalizeProjectDisplayLocation("carousel")).toBe("carousel");
    expect(normalizeProjectDisplayLocation("unknown")).toBe("both");
    expect(isProjectVisibleInLocation({ display_location: "grid" }, "carousel")).toBe(false);
    expect(isProjectVisibleInLocation({ display_location: "both" }, "carousel")).toBe(true);
  });

  it("ينشئ ويفك رابط المشروع المختصر القابل للمشاركة", () => {
    expect(projectHash("car-advertisement")).toBe("#project/car-advertisement");
    expect(slugFromProjectHash("#project/car-advertisement")).toBe("car-advertisement");
    expect(slugFromProjectHash("#work")).toBeNull();
  });
});
