import type { AdminEntity } from "./db";

const bilingualPairs: Partial<Record<AdminEntity, Array<[string, string]>>> = {
  projects: [["titleEn", "titleAr"]],
  categories: [["titleEn", "titleAr"]],
  services: [["titleEn", "titleAr"]],
  achievements: [["titleEn", "titleAr"]],
  clients: [["nameEn", "nameAr"]],
  partners: [["nameEn", "nameAr"]],
  testimonials: [["quoteEn", "quoteAr"]],
  faqs: [["questionEn", "questionAr"], ["answerEn", "answerAr"]],
  pages: [["titleEn", "titleAr"]],
};

const slugEntities = new Set<AdminEntity>(["projects", "categories", "services", "pages"]);
const numberKeys = new Set(["sortOrder", "navigationOrder"]);

function isBlank(value: unknown) {
  return typeof value !== "string" || value.trim().length === 0;
}

export function normalizeAdminContentValues(entity: AdminEntity, input: Record<string, unknown>) {
  const values = Object.fromEntries(
    Object.entries(input)
      .filter(([key]) => key !== "id" && key !== "createdAt" && key !== "updatedAt")
      .map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
  ) as Record<string, unknown>;

  for (const [englishKey, arabicKey] of bilingualPairs[entity] ?? []) {
    if (isBlank(values[englishKey]) && typeof values[arabicKey] === "string" && values[arabicKey].trim()) {
      values[englishKey] = values[arabicKey];
    }
  }

  Array.from(numberKeys).forEach(key => {
    if (values[key] === null || values[key] === "") delete values[key];
  });

  if (slugEntities.has(entity) && isBlank(values.slug)) {
    values.slug = `${entity}-${Date.now().toString(36)}`;
  }

  return values;
}
