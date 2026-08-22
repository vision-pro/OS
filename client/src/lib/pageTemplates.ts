export const pageTemplates = [
  { value: "landing", label: "الصفحة الرئيسية", description: "رسالة الاستوديو، العرض الافتتاحي وأقسام الموقع الأساسية." },
  { value: "portfolio", label: "معرض الأعمال", description: "عرض المشاريع المنشورة والتصنيفات والوسائط المرتبطة." },
  { value: "services", label: "الخدمات", description: "بطاقات الخدمات وما يقدمه الاستوديو للعملاء." },
  { value: "about", label: "من نحن", description: "تعريف الشركة والرؤية وطريقة العمل." },
  { value: "contact", label: "تواصل معنا", description: "قنوات التواصل ونموذج طلب الاستشارة." },
  { value: "standard", label: "صفحة محتوى عامة", description: "صفحة مرنة لمحتوى خاص أو إعلان أو حملة." },
] as const;

export type PageTemplate = (typeof pageTemplates)[number]["value"];

export function isSupportedPageTemplate(value: unknown): value is PageTemplate {
  return typeof value === "string" && pageTemplates.some((template) => template.value === value);
}
