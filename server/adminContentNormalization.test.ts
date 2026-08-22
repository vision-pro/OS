import { describe, expect, it } from "vitest";
import { normalizeAdminContentValues } from "./adminContentNormalization";

describe("normalizeAdminContentValues", () => {
  it("يحتفظ بالمحتوى العربي عند ترك الحقول الإنجليزية الاختيارية فارغة", () => {
    expect(normalizeAdminContentValues("services", {
      slug: "cinematic-production",
      titleAr: "إنتاج سينمائي",
      titleEn: "",
      sortOrder: "",
    })).toMatchObject({
      slug: "cinematic-production",
      titleAr: "إنتاج سينمائي",
      titleEn: "إنتاج سينمائي",
    });
  });

  it("لا يرسل ترتيب عرض فارغاً يمنع قاعدة البيانات من استخدام قيمتها الافتراضية", () => {
    const values = normalizeAdminContentValues("clients", { nameAr: "عميل", nameEn: "", sortOrder: null });
    expect(values).toMatchObject({ nameAr: "عميل", nameEn: "عميل" });
    expect(values).not.toHaveProperty("sortOrder");
  });

  it("ينشئ رابطاً داخلياً آمناً عندما لا يكتب المستخدم رابطاً مختصراً", () => {
    const values = normalizeAdminContentValues("pages", { slug: "", titleAr: "صفحة جديدة", titleEn: "" });
    expect(values.slug).toMatch(/^pages-/);
    expect(values.titleEn).toBe("صفحة جديدة");
  });
});
