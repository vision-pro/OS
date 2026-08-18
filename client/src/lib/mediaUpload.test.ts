import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadMediaFile } from "./mediaUpload";

class UploadRequestMock {
  static latest: UploadRequestMock | null = null;
  status = 201;
  responseText = '{"id":30001}';
  withCredentials = false;
  upload: { onprogress?: (event: { lengthComputable: boolean; loaded: number; total: number }) => void } = {};
  onerror: (() => void) | null = null;
  onload: (() => void) | null = null;
  open = vi.fn();
  setRequestHeader = vi.fn();

  constructor() {
    UploadRequestMock.latest = this;
  }

  send(file: File) {
    this.upload.onprogress?.({ lengthComputable: true, loaded: file.size / 2, total: file.size });
    this.upload.onprogress?.({ lengthComputable: true, loaded: file.size, total: file.size });
    this.onload?.();
  }
}

afterEach(() => vi.unstubAllGlobals());

describe("uploadMediaFile", () => {
  it("sends binary media with credentials and reports upload progress", async () => {
    vi.stubGlobal("XMLHttpRequest", UploadRequestMock);
    const progress: number[] = [];
    const file = { name: "vision-upload-verification.mp4", type: "video/mp4", size: 2_848_208 } as File;

    await expect(uploadMediaFile(file, { onProgress: value => progress.push(value) })).resolves.toEqual({ id: 30001 });

    expect(UploadRequestMock.latest?.open).toHaveBeenCalledWith("POST", expect.stringContaining("fileName=vision-upload-verification.mp4"));
    expect(UploadRequestMock.latest?.withCredentials).toBe(true);
    expect(UploadRequestMock.latest?.setRequestHeader).toHaveBeenCalledWith("Content-Type", "video/mp4");
    expect(progress).toEqual([50, 100]);
  });
});
