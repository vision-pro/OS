import { describe, expect, it } from "vitest";
import { isSupportedPageTemplate, pageTemplates } from "./pageTemplates";

describe("page templates", () => {
  it("يوفر القوالب المرئية المعتمدة فقط", () => {
    expect(pageTemplates.map((template) => template.value)).toEqual([
      "landing", "portfolio", "services", "about", "contact", "standard",
    ]);
  });

  it("يرفض أي قيمة قالب غير معتمدة", () => {
    expect(isSupportedPageTemplate("portfolio")).toBe(true);
    expect(isSupportedPageTemplate("custom-html")).toBe(false);
  });
});
