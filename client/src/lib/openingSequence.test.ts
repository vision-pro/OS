import { describe, expect, it } from "vitest";
import { shouldPresentOpening } from "./openingSequence";

describe("shouldPresentOpening", () => {
  it("shows the opening sequence for a first home-page visit", () => {
    expect(shouldPresentOpening({ isHome: true, previouslySeen: false, reducedMotion: false })).toBe(true);
  });

  it("does not show the sequence again or when reduced motion is preferred", () => {
    expect(shouldPresentOpening({ isHome: true, previouslySeen: true, reducedMotion: false })).toBe(false);
    expect(shouldPresentOpening({ isHome: true, previouslySeen: false, reducedMotion: true })).toBe(false);
    expect(shouldPresentOpening({ isHome: false, previouslySeen: false, reducedMotion: false })).toBe(false);
  });
});
