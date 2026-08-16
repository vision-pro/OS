import { describe, expect, it } from "vitest";
import { getCarouselIndex } from "./clientCarousel";

describe("client logo carousel navigation", () => {
  it("loops forward and backward without exposing partial indices", () => {
    expect(getCarouselIndex(0, 4, 3, 1)).toBe(1);
    expect(getCarouselIndex(1, 4, 3, 1)).toBe(0);
    expect(getCarouselIndex(0, 4, 3, -1)).toBe(1);
  });

  it("stays static when all client marks fit in view", () => {
    expect(getCarouselIndex(0, 3, 3, 1)).toBe(0);
  });
});
