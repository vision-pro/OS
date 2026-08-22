import { describe, expect, it } from "vitest";
import { normalizeMediaIds, toggleProjectMediaId } from "./projectMediaSelection";

describe("project media selection", () => {
  it("normalizes only unique positive media identifiers", () => {
    expect(normalizeMediaIds([4, "4", 9, 0, "invalid"])).toEqual([4, 9]);
  });

  it("adds and removes a selected media identifier", () => {
    expect(toggleProjectMediaId([4], 9)).toEqual([4, 9]);
    expect(toggleProjectMediaId([4, 9], 4)).toEqual([9]);
  });
});
