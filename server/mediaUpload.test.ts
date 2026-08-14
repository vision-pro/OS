import { describe, expect, it } from "vitest";
import { MAX_STANDARD_UPLOAD_BYTES, MAX_VIDEO_UPLOAD_BYTES, getUploadLimit, validateMediaUpload } from "./mediaUpload";

describe("media upload limits", () => {
  it("allows videos up to 500 MB while retaining a lower limit for other media", () => {
    expect(getUploadLimit("video/mp4")).toBe(MAX_VIDEO_UPLOAD_BYTES);
    expect(getUploadLimit("image/png")).toBe(MAX_STANDARD_UPLOAD_BYTES);
    expect(validateMediaUpload("video/mp4", MAX_VIDEO_UPLOAD_BYTES).valid).toBe(true);
    expect(validateMediaUpload("image/png", MAX_STANDARD_UPLOAD_BYTES + 1).valid).toBe(false);
  });

  it("returns a meaningful limit for oversized videos", () => {
    const result = validateMediaUpload("video/mp4", MAX_VIDEO_UPLOAD_BYTES + 1);
    expect(result.valid).toBe(false);
    expect(result.maxBytes).toBe(MAX_VIDEO_UPLOAD_BYTES);
  });

  it("rejects formats that are not approved for the media library", () => {
    const result = validateMediaUpload("application/x-msdownload", 1024);
    expect(result.valid).toBe(false);
    expect(result.validType).toBe(false);
  });
});
