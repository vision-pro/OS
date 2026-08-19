import { describe, expect, it } from "vitest";
import { getPublicSiteRedirectTarget } from "./publicSiteRedirect";

describe("getPublicSiteRedirectTarget", () => {
  it("moves public Manus visits to GitHub Pages while retaining query and fragment", () => {
    expect(getPublicSiteRedirectTarget({
      hostname: "visionportf-gwxs956w.manus.space",
      pathname: "/",
      search: "?lang=ar",
      hash: "#clients",
    } as Location)).toBe("https://vision-pro.github.io/OS/?lang=ar#clients");
  });

  it("keeps administration, local previews, and explicit fallback visits on Manus", () => {
    expect(getPublicSiteRedirectTarget({ hostname: "visionportf-gwxs956w.manus.space", pathname: "/admin", search: "", hash: "" } as Location)).toBeNull();
    expect(getPublicSiteRedirectTarget({ hostname: "localhost", pathname: "/", search: "", hash: "" } as Location)).toBeNull();
    expect(getPublicSiteRedirectTarget({ hostname: "visionportf-gwxs956w.manus.space", pathname: "/", search: "?stay=1", hash: "" } as Location)).toBeNull();
  });
});
