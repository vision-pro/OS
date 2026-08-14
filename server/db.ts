import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  achievements,
  bookings,
  clients,
  contactRequests,
  faqs,
  instagramSyncConfigs,
  instagramVideos,
  InsertUser,
  mediaAssets,
  pages,
  partners,
  portfolioCategories,
  projects,
  services,
  siteSettings,
  testimonials,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export function isConfiguredAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ENV.adminEmails.split(",").map(value => value.trim().toLowerCase()).filter(Boolean).includes(normalized);
}

export function resolveUserRole(user: Pick<InsertUser, "openId" | "email" | "role">): "admin" | "user" | undefined {
  if (user.role !== undefined) return user.role;
  if (user.openId === ENV.ownerOpenId || isConfiguredAdminEmail(user.email)) return "admin";
  return user.email !== undefined ? "user" : undefined;
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  const resolvedRole = resolveUserRole(user);
  if (resolvedRole) {
    values.role = resolvedRole;
    updateSet.role = resolvedRole;
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

const defaultServices = [
  {
    slug: "cinematic-advertising",
    titleAr: "إعلانات سينمائية",
    titleEn: "Cinematic Advertising",
    summaryAr: "من الفكرة إلى المونتاج، نصنع إعلاناً يحضر في الذاكرة.",
    summaryEn: "From concept to edit, we create advertising that stays with the audience.",
    descriptionAr: "نحوّل رسالتك إلى تجربة بصرية متقنة تجمع الفكرة، الإخراج، التصوير، وما بعد الإنتاج.",
    descriptionEn: "We turn your message into a precise visual experience spanning concept, direction, production, and post-production.",
    icon: "Clapperboard",
    sortOrder: 1,
    isActive: true,
  },
  {
    slug: "visual-identity",
    titleAr: "هوية بصرية",
    titleEn: "Visual Identity",
    summaryAr: "هوية واضحة وجريئة تمنح العلامة حضوراً لا يُنسى.",
    summaryEn: "Clear, bold identities that give brands an unmistakable presence.",
    descriptionAr: "نبني نظاماً بصرياً متماسكاً يترجم شخصيّة العلامة إلى تفاصيل قابلة للتطبيق.",
    descriptionEn: "We build cohesive visual systems that translate brand character into repeatable detail.",
    icon: "Palette",
    sortOrder: 2,
    isActive: true,
  },
  {
    slug: "event-production",
    titleAr: "إنتاج فعاليات",
    titleEn: "Event Production",
    summaryAr: "تغطية وإخراج يلتقطان اللحظة ويمنحانها امتداداً.",
    summaryEn: "Coverage and direction that capture the moment and extend its impact.",
    descriptionAr: "نرافق الحدث من التخطيط وحتى تسليم المحتوى، بإيقاع بصري يحترم قيمة التجربة.",
    descriptionEn: "We support events from planning through delivery with a visual rhythm worthy of the experience.",
    icon: "Sparkles",
    sortOrder: 3,
    isActive: true,
  },
  {
    slug: "ai-content",
    titleAr: "محتوى بالذكاء الاصطناعي",
    titleEn: "AI-Assisted Content",
    summaryAr: "أدوات ذكية في خدمة فكرة إنسانية أصيلة.",
    summaryEn: "Intelligent tools in service of an original human idea.",
    descriptionAr: "نستخدم تقنيات الذكاء الاصطناعي لتعزيز سرعة التصور وتوسيع احتمالات الحكاية البصرية.",
    descriptionEn: "We use AI techniques to accelerate ideation and expand the possibilities of visual storytelling.",
    icon: "WandSparkles",
    sortOrder: 4,
    isActive: true,
  },
];

const defaultPages = [
  {
    slug: "home",
    template: "home",
    titleAr: "رؤية للإنتاج الفني",
    titleEn: "Ru'ya for Artistic Production",
    heroTitleAr: "نصنع الصورة التي تُروى",
    heroTitleEn: "We Make the Image That Gets Told",
    heroTextAr: "استوديو إنتاج إبداعي يحوّل الرؤى إلى حكايات بصرية دقيقة، جريئة، وقابلة للتذكّر.",
    heroTextEn: "A creative production studio that turns vision into precise, bold, memorable visual stories.",
    seoTitleAr: "رؤية للإنتاج الفني | نصنع الصورة التي تُروى",
    seoTitleEn: "Ru'ya for Artistic Production | Stories in Motion",
    seoDescriptionAr: "إنتاج إعلانات سينمائية وهويات بصرية وفعاليات ومحتوى مدعوم بالذكاء الاصطناعي.",
    seoDescriptionEn: "Cinematic advertising, visual identity, event production, and AI-assisted creative content.",
    seoKeywords: "رؤية, إنتاج فني, إعلانات سينمائية, هوية بصرية, فعاليات, Vision Production",
    showInNavigation: false,
    navigationOrder: 0,
    status: "published" as const,
  },
  {
    slug: "about",
    template: "about",
    titleAr: "من نحن",
    titleEn: "About Us",
    heroTitleAr: "كل مشروع يبدأ برؤية واضحة",
    heroTitleEn: "Every Project Starts with a Clear Vision",
    heroTextAr: "نحن فريق إنتاج إبداعي في النجف، نؤمن بأن أفضل صورة هي التي تخدم الفكرة وتبقى بعدها.",
    heroTextEn: "We are a creative production team in Najaf, believing that the strongest image serves the idea and stays beyond the moment.",
    seoTitleAr: "من نحن | رؤية للإنتاج الفني",
    seoTitleEn: "About Ru'ya | Artistic Production",
    seoDescriptionAr: "تعرّف إلى منهج رؤية للإنتاج الفني في بناء الحكايات البصرية.",
    seoDescriptionEn: "Discover Ru'ya's approach to building visual stories.",
    seoKeywords: "رؤية للإنتاج الفني, من نحن, استوديو إنتاج إبداعي",
    showInNavigation: true,
    navigationOrder: 1,
    status: "published" as const,
  },
  {
    slug: "services",
    template: "services",
    titleAr: "خدماتنا",
    titleEn: "Services",
    heroTitleAr: "إنتاج يحرّك الفكرة إلى الأمام",
    heroTitleEn: "Production That Moves Ideas Forward",
    heroTextAr: "من الإعلان إلى الفعالية والهوية، نجمع التخصصات لصناعة أثر بصري متسق.",
    heroTextEn: "From advertising to events and identity, we connect disciplines to create cohesive visual impact.",
    seoTitleAr: "خدمات رؤية للإنتاج الفني",
    seoTitleEn: "Ru'ya Production Services",
    seoDescriptionAr: "خدمات الإنتاج السينمائي والهوية والفعاليات والمحتوى المدعوم بالذكاء الاصطناعي.",
    seoDescriptionEn: "Cinematic production, visual identity, events, and AI-assisted content services.",
    seoKeywords: "إنتاج فني, إعلانات, هوية بصرية, فعاليات",
    showInNavigation: true,
    navigationOrder: 2,
    status: "published" as const,
  },
  {
    slug: "portfolio",
    template: "portfolio",
    titleAr: "الأعمال",
    titleEn: "Portfolio",
    heroTitleAr: "أعمال تبدأ من فكرة وتنتهي بأثر",
    heroTitleEn: "Work That Begins with an Idea and Ends with Impact",
    heroTextAr: "استكشف مختارات من المشاريع المنشورة. ستتمكن من تصنيف كل مشروع وعرض وسائطه من لوحة التحكم.",
    heroTextEn: "Explore selected published projects. Each project, category, and media asset is managed from the dashboard.",
    seoTitleAr: "أعمال رؤية للإنتاج الفني",
    seoTitleEn: "Ru'ya Portfolio",
    seoDescriptionAr: "مختارات من أعمال رؤية للإنتاج الفني.",
    seoDescriptionEn: "Selected work from Ru'ya for Artistic Production.",
    seoKeywords: "أعمال, بورتفوليو, إنتاج فني",
    showInNavigation: true,
    navigationOrder: 3,
    status: "published" as const,
  },
  {
    slug: "achievements",
    template: "achievements",
    titleAr: "الإنجازات",
    titleEn: "Achievements",
    heroTitleAr: "ما ننجزه يروي طريقة عملنا",
    heroTitleEn: "What We Achieve Reflects How We Work",
    heroTextAr: "هذه المساحة مخصصة للإنجازات والتكريمات التي تعتمدها الشركة وتضيفها من لوحة التحكم.",
    heroTextEn: "This space is reserved for verified achievements and recognitions approved by the company through the dashboard.",
    seoTitleAr: "إنجازات رؤية للإنتاج الفني",
    seoTitleEn: "Ru'ya Achievements",
    seoDescriptionAr: "إنجازات رؤية للإنتاج الفني المعتمدة.",
    seoDescriptionEn: "Approved achievements of Ru'ya for Artistic Production.",
    seoKeywords: "إنجازات, إنتاج فني",
    showInNavigation: true,
    navigationOrder: 4,
    status: "published" as const,
  },
  {
    slug: "clients",
    template: "clients",
    titleAr: "العملاء",
    titleEn: "Clients",
    heroTitleAr: "شراكات تصنع المسافة الأبعد",
    heroTitleEn: "Partnerships That Go Further",
    heroTextAr: "تدار شعارات العملاء والشركاء المعتمدين هنا من لوحة التحكم.",
    heroTextEn: "Approved client and partner identities are managed here through the dashboard.",
    seoTitleAr: "عملاء رؤية للإنتاج الفني",
    seoTitleEn: "Ru'ya Clients",
    seoDescriptionAr: "عملاء وشركاء رؤية للإنتاج الفني.",
    seoDescriptionEn: "Clients and partners of Ru'ya for Artistic Production.",
    seoKeywords: "عملاء, شركاء, رؤية للإنتاج الفني",
    showInNavigation: true,
    navigationOrder: 5,
    status: "published" as const,
  },
  {
    slug: "contact",
    template: "contact",
    titleAr: "تواصل معنا",
    titleEn: "Contact",
    heroTitleAr: "لنبدأ من الفكرة",
    heroTitleEn: "Let's Start with the Idea",
    heroTextAr: "أرسل تفاصيل مشروعك، أو احجز استشارة وسنحوّلك مباشرة إلى واتساب لاستكمال الحوار.",
    heroTextEn: "Share your project details, or book a consultation and continue the conversation directly on WhatsApp.",
    seoTitleAr: "تواصل مع رؤية للإنتاج الفني",
    seoTitleEn: "Contact Ru'ya for Artistic Production",
    seoDescriptionAr: "ابدأ حواراً عن مشروعك مع فريق رؤية للإنتاج الفني.",
    seoDescriptionEn: "Start a conversation about your project with Ru'ya for Artistic Production.",
    seoKeywords: "تواصل, حجز, واتساب, رؤية للإنتاج الفني",
    showInNavigation: true,
    navigationOrder: 6,
    status: "published" as const,
  },
];

let brandContentEnsured = false;

export async function ensureBrandContent() {
  if (brandContentEnsured) return;
  const db = await getDb();
  if (!db) return;
  const existingCompany = await db.select({ id: siteSettings.id }).from(siteSettings).where(eq(siteSettings.key, "company")).limit(1);
  if (existingCompany.length > 0) {
    brandContentEnsured = true;
    return;
  }
  for (const service of defaultServices) {
    await db.insert(services).values(service).onDuplicateKeyUpdate({ set: { slug: service.slug } });
  }
  for (const page of defaultPages) {
    await db.insert(pages).values(page).onDuplicateKeyUpdate({ set: { slug: page.slug } });
  }
  await db
    .insert(siteSettings)
    .values({
      key: "company",
      value: {
        nameAr: "رؤية للإنتاج الفني",
        nameEn: "Ru'ya for Artistic Production",
        whatsapp: "9647760076003",
        taglineAr: "نصنع الصورة التي تُروى",
        taglineEn: "We Make the Image That Gets Told",
      },
    })
    .onDuplicateKeyUpdate({ set: { key: "company" } });
  brandContentEnsured = true;
}

function selectMediaByIds(ids: number[], allMedia: Awaited<ReturnType<typeof getMediaByIds>>) {
  const mediaMap = new Map(allMedia.map(item => [item.id, item]));
  return ids.map(id => mediaMap.get(id)).filter(Boolean);
}

async function getMediaByIds(ids: number[]) {
  const db = await getDb();
  if (!db || ids.length === 0) return [];
  return db.select().from(mediaAssets).where(inArray(mediaAssets.id, ids));
}

export async function getPublicSiteData() {
  await ensureBrandContent();
  const db = await getDb();
  if (!db) return null;
  const [pageRows, serviceRows, projectRows, categoryRows, achievementRows, clientRows, partnerRows, faqRows, settingsRows, instagramVideoRows] = await Promise.all([
    db.select().from(pages).where(eq(pages.status, "published")).orderBy(asc(pages.navigationOrder)),
    db.select().from(services).where(eq(services.isActive, true)).orderBy(asc(services.sortOrder)),
    db.select().from(projects).where(eq(projects.status, "published")).orderBy(desc(projects.publishedAt)),
    db.select().from(portfolioCategories).where(eq(portfolioCategories.isActive, true)).orderBy(asc(portfolioCategories.sortOrder)),
    db.select().from(achievements).where(eq(achievements.isPublished, true)).orderBy(asc(achievements.sortOrder)),
    db.select().from(clients).where(eq(clients.isActive, true)).orderBy(asc(clients.sortOrder)),
    db.select().from(partners).where(eq(partners.isActive, true)).orderBy(asc(partners.sortOrder)),
    db.select().from(faqs).where(eq(faqs.isPublished, true)).orderBy(asc(faqs.sortOrder)),
    db.select().from(siteSettings),
    db.select().from(instagramVideos).where(eq(instagramVideos.status, "published")).orderBy(desc(instagramVideos.sourcePublishedAt)),
  ]);
  const mediaIds = [
    ...projectRows.flatMap(project => [project.coverMediaId, ...(project.mediaIds ?? [])]),
    ...serviceRows.map(item => item.coverMediaId),
    ...achievementRows.map(item => item.mediaId),
    ...clientRows.map(item => item.logoMediaId),
    ...partnerRows.map(item => item.logoMediaId),
    ...pageRows.map(item => item.heroMediaId),
  ].filter((id): id is number => typeof id === "number");
  const media = await getMediaByIds(Array.from(new Set(mediaIds)));
  return {
    pages: pageRows,
    services: serviceRows,
    projects: projectRows.map(project => ({ ...project, media: selectMediaByIds([project.coverMediaId, ...(project.mediaIds ?? [])].filter((id): id is number => typeof id === "number"), media) })),
    categories: categoryRows,
    achievements: achievementRows.map(item => ({ ...item, media: selectMediaByIds(item.mediaId ? [item.mediaId] : [], media)[0] ?? null })),
    clients: clientRows.map(item => ({ ...item, logo: selectMediaByIds(item.logoMediaId ? [item.logoMediaId] : [], media)[0] ?? null })),
    partners: partnerRows.map(item => ({ ...item, logo: selectMediaByIds(item.logoMediaId ? [item.logoMediaId] : [], media)[0] ?? null })),
    faqs: faqRows,
    instagramVideos: instagramVideoRows,
    settings: settingsRows,
  };
}

export async function createBooking(input: {
  name: string;
  phone: string;
  company?: string;
  serviceId?: number;
  projectType?: string;
  requestedDate?: string;
  budgetRange?: string;
  message?: string;
  preferredLanguage: "ar" | "en";
}) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const result = await db.insert(bookings).values(input);
  return { id: Number(result[0].insertId) };
}

export async function createContactRequest(input: {
  name: string;
  phone?: string;
  email?: string;
  subject?: string;
  message: string;
  preferredLanguage: "ar" | "en";
}) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const result = await db.insert(contactRequests).values(input);
  return { id: Number(result[0].insertId) };
}

const adminEntityMap = {
  projects,
  categories: portfolioCategories,
  services,
  achievements,
  clients,
  partners,
  testimonials,
  faqs,
  pages,
} as const;

export type AdminEntity = keyof typeof adminEntityMap;

export async function listAdminEntity(entity: AdminEntity) {
  const db = await getDb();
  if (!db) return [];
  const table = adminEntityMap[entity] as any;
  return db.select().from(table).orderBy(desc(table.updatedAt ?? table.createdAt));
}

export async function saveAdminEntity(entity: AdminEntity, id: number | undefined, values: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const table = adminEntityMap[entity] as any;
  const cleanValues = Object.fromEntries(Object.entries(values).filter(([key]) => key !== "id" && key !== "createdAt" && key !== "updatedAt"));
  if (id) {
    await db.update(table).set(cleanValues).where(eq(table.id, id));
    return { id };
  }
  const result = await db.insert(table).values(cleanValues);
  return { id: Number(result[0].insertId) };
}

export async function deleteAdminEntity(entity: AdminEntity, id: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const table = adminEntityMap[entity] as any;
  await db.delete(table).where(eq(table.id, id));
}

export async function getAdminOverview() {
  const db = await getDb();
  if (!db) return { projects: 0, bookings: 0, contacts: 0, media: 0, instagramVideos: 0 };
  const [projectRows, bookingRows, contactRows, mediaRows, instagramVideoRows] = await Promise.all([
    db.select({ id: projects.id }).from(projects),
    db.select({ id: bookings.id }).from(bookings).where(eq(bookings.status, "new")),
    db.select({ id: contactRequests.id }).from(contactRequests).where(eq(contactRequests.status, "new")),
    db.select({ id: mediaAssets.id }).from(mediaAssets),
    db.select({ id: instagramVideos.id }).from(instagramVideos),
  ]);
  return { projects: projectRows.length, bookings: bookingRows.length, contacts: contactRows.length, media: mediaRows.length, instagramVideos: instagramVideoRows.length };
}

export async function listMedia() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
}

export async function saveMediaAsset(values: typeof mediaAssets.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const result = await db.insert(mediaAssets).values(values);
  return { id: Number(result[0].insertId) };
}

export async function listRequests(kind: "bookings" | "contacts") {
  const db = await getDb();
  if (!db) return [];
  return kind === "bookings"
    ? db.select().from(bookings).orderBy(desc(bookings.createdAt))
    : db.select().from(contactRequests).orderBy(desc(contactRequests.createdAt));
}

export async function updateRequestStatus(kind: "bookings" | "contacts", id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  if (kind === "bookings") {
    await db.update(bookings).set({ status: status as "new" | "contacted" | "confirmed" | "closed" }).where(eq(bookings.id, id));
  } else {
    await db.update(contactRequests).set({ status: status as "new" | "read" | "resolved" }).where(eq(contactRequests.id, id));
  }
}

export async function listAdminUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.lastSignedIn));
}

export async function updateUserRole(id: number, role: "admin" | "user") {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.update(users).set({ role }).where(eq(users.id, id));
}

export async function listSiteSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteSettings).orderBy(asc(siteSettings.key));
}

export async function saveSiteSetting(key: string, value: Record<string, unknown>, updatedById: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db
    .insert(siteSettings)
    .values({ key, value, updatedById })
    .onDuplicateKeyUpdate({ set: { value, updatedById } });
}

const VISION_FACEBOOK_PAGE_ID = "830116313518371";

type InstagramMediaResponse = {
  data?: Array<{
    id: string;
    caption?: string;
    media_type?: string;
    media_product_type?: string;
    permalink?: string;
    shortcode?: string;
    thumbnail_url?: string;
    timestamp?: string;
  }>;
  error?: { message?: string };
};

async function instagramGraph<T>(path: string, params: Record<string, string>): Promise<T> {
  if (!ENV.instagramGraphAccessToken) throw new Error("رمز Instagram Graph API غير مهيأ.");
  const url = new URL(`https://graph.facebook.com/v23.0${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set("access_token", ENV.instagramGraphAccessToken);
  const response = await fetch(url);
  const body = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(body.error?.message || "تعذر الاتصال بـ Instagram Graph API.");
  return body;
}

export async function getOrCreateInstagramSyncConfig() {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const existing = await db.select().from(instagramSyncConfigs).where(eq(instagramSyncConfigs.facebookPageId, VISION_FACEBOOK_PAGE_ID)).limit(1);
  if (existing[0]) return existing[0];
  const result = await db.insert(instagramSyncConfigs).values({ facebookPageId: VISION_FACEBOOK_PAGE_ID });
  const created = await db.select().from(instagramSyncConfigs).where(eq(instagramSyncConfigs.id, Number(result[0].insertId))).limit(1);
  if (!created[0]) throw new Error("تعذر تهيئة إعدادات مزامنة Instagram.");
  return created[0];
}

export async function getInstagramSyncConfigByTaskUid(taskUid: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(instagramSyncConfigs).where(eq(instagramSyncConfigs.scheduleCronTaskUid, taskUid)).limit(1);
  return rows[0];
}

export async function listInstagramVideos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(instagramVideos).orderBy(desc(instagramVideos.sourcePublishedAt));
}

export async function updateInstagramVideoStatus(id: number, status: "draft" | "published" | "archived", approvedById: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const publishFields = status === "published" ? { approvedById, approvedAt: new Date() } : { approvedById: null, approvedAt: null };
  await db.update(instagramVideos).set({ status, ...publishFields }).where(eq(instagramVideos.id, id));
}

export async function updateInstagramSchedule(configId: number, values: { cronExpression?: string; scheduleCronTaskUid?: string | null; isScheduleEnabled?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  await db.update(instagramSyncConfigs).set(values).where(eq(instagramSyncConfigs.id, configId));
}

export async function syncInstagramVideos(configId?: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة حالياً");
  const config = configId
    ? (await db.select().from(instagramSyncConfigs).where(eq(instagramSyncConfigs.id, configId)).limit(1))[0]
    : await getOrCreateInstagramSyncConfig();
  if (!config) throw new Error("إعدادات مزامنة Instagram غير موجودة.");

  try {
    const page = await instagramGraph<{ instagram_business_account?: { id?: string; username?: string } }>(`/${config.facebookPageId}`, {
      fields: "instagram_business_account{id,username}",
    });
    const account = page.instagram_business_account;
    if (!account?.id) throw new Error("لا يوجد حساب Instagram مهني مرتبط بصفحة الشركة.");

    const feed = await instagramGraph<InstagramMediaResponse>(`/${account.id}/media`, {
      fields: "id,caption,media_type,media_product_type,permalink,shortcode,thumbnail_url,timestamp",
      limit: "100",
    });
    const videos = (feed.data ?? []).filter(item => (item.media_type === "VIDEO" || item.media_product_type === "REELS") && item.permalink);
    let imported = 0;
    for (const item of videos) {
      const sourcePublishedAt = item.timestamp ? new Date(item.timestamp) : null;
      await db.insert(instagramVideos).values({
        syncConfigId: config.id,
        sourceMediaId: item.id,
        shortcode: item.shortcode ?? null,
        permalink: item.permalink!,
        caption: item.caption ?? null,
        thumbnailUrl: item.thumbnail_url ?? null,
        mediaType: item.media_type ?? null,
        mediaProductType: item.media_product_type ?? null,
        sourcePublishedAt,
      }).onDuplicateKeyUpdate({
        set: {
          permalink: item.permalink!,
          caption: item.caption ?? null,
          thumbnailUrl: item.thumbnail_url ?? null,
          mediaType: item.media_type ?? null,
          mediaProductType: item.media_product_type ?? null,
          sourcePublishedAt,
          lastSyncedAt: new Date(),
        },
      });
      imported += 1;
    }
    await db.update(instagramSyncConfigs).set({
      instagramAccountId: account.id,
      instagramUsername: account.username ?? null,
      lastSyncedAt: new Date(),
      lastSyncStatus: "success",
      lastSyncError: null,
    }).where(eq(instagramSyncConfigs.id, config.id));
    return { imported, instagramAccountId: account.id, instagramUsername: account.username ?? null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.update(instagramSyncConfigs).set({ lastSyncStatus: "error", lastSyncError: message }).where(eq(instagramSyncConfigs.id, config.id));
    throw error;
  }
}
