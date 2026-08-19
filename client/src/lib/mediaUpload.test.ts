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
  it("uploads binary media directly after presigning and reports upload progress", async () => {
    vi.stubGlobal("XMLHttpRequest", UploadRequestMock);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ uploadUrl: "https://storage.example/upload", key: "vision-production/media/file.mp4", url: "/manus-storage/vision-production/media/file.mp4" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 30001 }) });
    vi.stubGlobal("fetch", fetchMock);
    const progress: number[] = [];
    const file = { name: "vision-upload-verification.mp4", type: "video/mp4", size: 2_848_208 } as File;

    await expect(uploadMediaFile(file, { onProgress: value => progress.push(value) })).resolves.toEqual({ id: 30001 });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/media/presign", expect.objectContaining({ method: "POST", credentials: "include" }));
    expect(UploadRequestMock.latest?.open).toHaveBeenCalledWith("PUT", "https://storage.example/upload");
    expect(UploadRequestMock.latest?.setRequestHeader).toHaveBeenCalledWith("Content-Type", "video/mp4");
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/media/finalize", expect.objectContaining({ method: "POST", credentials: "include" }));
    expect(progress).toEqual([50, 100]);
  });
});
