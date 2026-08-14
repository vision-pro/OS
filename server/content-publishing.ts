export const adminEntities = [
  "projects",
  "categories",
  "services",
  "achievements",
  "clients",
  "partners",
  "testimonials",
  "faqs",
  "pages",
] as const;

export type AdminContentEntity = (typeof adminEntities)[number];

const statusEntities = new Set<AdminContentEntity>(["projects", "pages"]);
const publishedFlagEntities = new Set<AdminContentEntity>(["achievements", "testimonials", "faqs"]);

/**
 * Returns the persisted fields that control whether an entity is visible on
 * the public website. Keeping this mapping in one place prevents a dashboard
 * control from updating a field the public query does not read.
 */
export function publicationUpdate(entity: AdminContentEntity, published: boolean): Record<string, unknown> {
  if (statusEntities.has(entity)) {
    return {
      status: published ? "published" : "draft",
      ...(entity === "projects" && published ? { publishedAt: new Date() } : {}),
    };
  }

  if (publishedFlagEntities.has(entity)) {
    return { isPublished: published };
  }

  return { isActive: published };
}

export function isPubliclyPublished(entity: AdminContentEntity, row: Record<string, unknown>): boolean {
  if (statusEntities.has(entity)) return row.status === "published";
  if (publishedFlagEntities.has(entity)) return row.isPublished === true;
  return row.isActive === true;
}
