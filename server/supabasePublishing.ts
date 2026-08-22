const SUPABASE_URL = "https://hpzrsuygkbkbxfihgbyu.supabase.co";

export type SupabaseEntity = "projects" | "categories" | "services" | "achievements" | "clients" | "partners" | "testimonials" | "faqs" | "pages";

type SyncDependencies = {
  resolveMediaId: (id: number | null | undefined) => Promise<string | null>;
  resolveCategoryId: (id: number | null | undefined) => Promise<string | null>;
};

function withoutUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

export async function toSupabasePayload(entity: SupabaseEntity, row: Record<string, any>, dependencies: SyncDependencies) {
  const resolveMediaIds = async (ids: number[] | null | undefined) => (await Promise.all((ids ?? []).map(id => dependencies.resolveMediaId(id)))).filter(Boolean);
  switch (entity) {
    case "categories": return { table: "portfolio_categories", conflict: "slug", payload: withoutUndefined({ slug: row.slug, title_ar: row.titleAr, title_en: row.titleEn, description_ar: row.descriptionAr, description_en: row.descriptionEn, sort_order: row.sortOrder, is_active: row.isActive }) };
    case "services": return { table: "services", conflict: "slug", payload: withoutUndefined({ slug: row.slug, title_ar: row.titleAr, title_en: row.titleEn, summary_ar: row.summaryAr, summary_en: row.summaryEn, description_ar: row.descriptionAr, description_en: row.descriptionEn, icon: row.icon, cover_media_id: await dependencies.resolveMediaId(row.coverMediaId), sort_order: row.sortOrder, is_active: row.isActive }) };
    case "projects": return { table: "projects", conflict: "slug", payload: withoutUndefined({ category_id: await dependencies.resolveCategoryId(row.categoryId), slug: row.slug, title_ar: row.titleAr, title_en: row.titleEn, summary_ar: row.summaryAr, summary_en: row.summaryEn, description_ar: row.descriptionAr, description_en: row.descriptionEn, client_name: row.clientName, project_date: row.projectDate, cover_media_id: await dependencies.resolveMediaId(row.coverMediaId), media_ids: await resolveMediaIds(row.mediaIds), content_ar: row.contentAr, content_en: row.contentEn, seo_title_ar: row.seoTitleAr, seo_title_en: row.seoTitleEn, seo_description_ar: row.seoDescriptionAr, seo_description_en: row.seoDescriptionEn, seo_keywords: row.seoKeywords, status: row.status, is_featured: row.isFeatured, published_at: row.publishedAt?.toISOString?.() ?? row.publishedAt ?? null }) };
    case "achievements": return { table: "achievements", conflict: null, match: { title_ar: row.titleAr, achievement_date: row.achievementDate ?? "" }, payload: withoutUndefined({ title_ar: row.titleAr, title_en: row.titleEn, description_ar: row.descriptionAr, description_en: row.descriptionEn, achievement_date: row.achievementDate, media_id: await dependencies.resolveMediaId(row.mediaId), sort_order: row.sortOrder, is_published: row.isPublished }) };
    case "clients": return { table: "clients", conflict: null, match: { name_ar: row.nameAr }, payload: withoutUndefined({ name_ar: row.nameAr, name_en: row.nameEn, logo_media_id: await dependencies.resolveMediaId(row.logoMediaId), website_url: row.websiteUrl, sort_order: row.sortOrder, is_active: row.isActive }) };
    case "partners": return { table: "partners", conflict: null, match: { name_ar: row.nameAr }, payload: withoutUndefined({ name_ar: row.nameAr, name_en: row.nameEn, logo_media_id: await dependencies.resolveMediaId(row.logoMediaId), website_url: row.websiteUrl, sort_order: row.sortOrder, is_active: row.isActive }) };
    case "testimonials": return { table: "testimonials", conflict: null, match: { author_name: row.authorName, quote_ar: row.quoteAr }, payload: withoutUndefined({ author_name: row.authorName, author_role_ar: row.authorRoleAr, author_role_en: row.authorRoleEn, quote_ar: row.quoteAr, quote_en: row.quoteEn, avatar_media_id: await dependencies.resolveMediaId(row.avatarMediaId), source_url: row.sourceUrl, is_verified: row.isVerified, is_published: row.isPublished, sort_order: row.sortOrder }) };
    case "faqs": return { table: "faqs", conflict: null, match: { question_ar: row.questionAr }, payload: withoutUndefined({ question_ar: row.questionAr, question_en: row.questionEn, answer_ar: row.answerAr, answer_en: row.answerEn, category: row.category, sort_order: row.sortOrder, is_published: row.isPublished }) };
    case "pages": return { table: "pages", conflict: "slug", payload: withoutUndefined({ slug: row.slug, template: row.template, title_ar: row.titleAr, title_en: row.titleEn, hero_title_ar: row.heroTitleAr, hero_title_en: row.heroTitleEn, hero_text_ar: row.heroTextAr, hero_text_en: row.heroTextEn, content_ar: row.contentAr, content_en: row.contentEn, hero_media_id: await dependencies.resolveMediaId(row.heroMediaId), seo_title_ar: row.seoTitleAr, seo_title_en: row.seoTitleEn, seo_description_ar: row.seoDescriptionAr, seo_description_en: row.seoDescriptionEn, seo_keywords: row.seoKeywords, show_in_navigation: row.showInNavigation, navigation_order: row.navigationOrder, status: row.status }) };
  }
}

function getSecret() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("مفتاح مزامنة Supabase غير متاح.");
  return secret;
}

async function rest(path: string, options: RequestInit = {}) {
  const secret = getSecret();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: { apikey: secret, Authorization: `Bearer ${secret}`, "Content-Type": "application/json", ...(options.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`تعذرت مزامنة Supabase (${response.status}).`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function syncSupabaseMedia(row: Record<string, any>) {
  const payload = { storage_key: row.storageKey, public_url: row.url, original_name: row.originalName, mime_type: row.mimeType, size_bytes: row.sizeBytes, kind: row.kind, alt_ar: row.altAr, alt_en: row.altEn, is_public: true };
  const rows = await rest("media_assets?on_conflict=storage_key", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(payload) });
  return rows?.[0]?.id as string | undefined;
}

export async function deactivateSupabaseMedia(storageKey: string) {
  await rest(`media_assets?storage_key=eq.${encodeURIComponent(storageKey)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ is_public: false }),
  });
}

export async function syncEntityToSupabase(entity: SupabaseEntity, row: Record<string, any>, dependencies: SyncDependencies) {
  const detail = await toSupabasePayload(entity, row, dependencies);
  if (detail.conflict) {
    await rest(`${detail.table}?on_conflict=${detail.conflict}`, { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(detail.payload) });
    return;
  }
  const filters = Object.entries(detail.match ?? {}).map(([key, value]) => `${key}=eq.${encodeURIComponent(String(value))}`).join("&");
  const existing = await rest(`${detail.table}?${filters}&select=id&limit=1`);
  if (existing?.[0]?.id) {
    await rest(`${detail.table}?id=eq.${existing[0].id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(detail.payload) });
  } else {
    await rest(detail.table, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(detail.payload) });
  }
}
