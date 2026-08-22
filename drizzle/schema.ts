import {
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const mediaAssets = mysqlTable(
  "mediaAssets",
  {
    id: int("id").autoincrement().primaryKey(),
    storageKey: varchar("storageKey", { length: 512 }).notNull().unique(),
    url: varchar("url", { length: 1024 }).notNull(),
    originalName: varchar("originalName", { length: 255 }).notNull(),
    mimeType: varchar("mimeType", { length: 120 }).notNull(),
    sizeBytes: int("sizeBytes").notNull(),
    kind: mysqlEnum("kind", ["image", "video", "document", "other"]).default("image").notNull(),
    altAr: varchar("altAr", { length: 300 }),
    altEn: varchar("altEn", { length: 300 }),
    createdById: int("createdById"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("media_created_by_idx").on(table.createdById)],
);

export const portfolioCategories = mysqlTable(
  "portfolioCategories",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    titleAr: varchar("titleAr", { length: 180 }).notNull(),
    titleEn: varchar("titleEn", { length: 180 }).notNull(),
    descriptionAr: text("descriptionAr"),
    descriptionEn: text("descriptionEn"),
    sortOrder: int("sortOrder").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("category_sort_idx").on(table.sortOrder, table.isActive)],
);

export const projects = mysqlTable(
  "projects",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("categoryId"),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    titleAr: varchar("titleAr", { length: 250 }).notNull(),
    titleEn: varchar("titleEn", { length: 250 }).notNull(),
    summaryAr: text("summaryAr"),
    summaryEn: text("summaryEn"),
    descriptionAr: text("descriptionAr"),
    descriptionEn: text("descriptionEn"),
    clientName: varchar("clientName", { length: 250 }),
    projectDate: varchar("projectDate", { length: 50 }),
    coverMediaId: int("coverMediaId"),
    posterMediaId: int("posterMediaId"),
    mediaIds: json("mediaIds").$type<number[]>(),
    contentAr: json("contentAr").$type<Record<string, unknown>>(),
    contentEn: json("contentEn").$type<Record<string, unknown>>(),
    seoTitleAr: varchar("seoTitleAr", { length: 180 }),
    seoTitleEn: varchar("seoTitleEn", { length: 180 }),
    seoDescriptionAr: varchar("seoDescriptionAr", { length: 320 }),
    seoDescriptionEn: varchar("seoDescriptionEn", { length: 320 }),
    seoKeywords: varchar("seoKeywords", { length: 500 }),
    status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    displayLocation: mysqlEnum("displayLocation", ["grid", "carousel", "both"]).default("both").notNull(),
    publishedAt: timestamp("publishedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("project_category_idx").on(table.categoryId),
    index("project_featured_idx").on(table.isFeatured, table.status),
    index("project_cover_idx").on(table.coverMediaId),
    index("project_poster_idx").on(table.posterMediaId),
  ],
);

export const services = mysqlTable(
  "services",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    titleAr: varchar("titleAr", { length: 180 }).notNull(),
    titleEn: varchar("titleEn", { length: 180 }).notNull(),
    summaryAr: text("summaryAr"),
    summaryEn: text("summaryEn"),
    descriptionAr: text("descriptionAr"),
    descriptionEn: text("descriptionEn"),
    icon: varchar("icon", { length: 80 }),
    coverMediaId: int("coverMediaId"),
    sortOrder: int("sortOrder").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("service_sort_idx").on(table.sortOrder, table.isActive)],
);

export const achievements = mysqlTable(
  "achievements",
  {
    id: int("id").autoincrement().primaryKey(),
    titleAr: varchar("titleAr", { length: 240 }).notNull(),
    titleEn: varchar("titleEn", { length: 240 }).notNull(),
    descriptionAr: text("descriptionAr"),
    descriptionEn: text("descriptionEn"),
    achievementDate: varchar("achievementDate", { length: 60 }),
    mediaId: int("mediaId"),
    sortOrder: int("sortOrder").default(0).notNull(),
    isPublished: boolean("isPublished").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("achievement_sort_idx").on(table.sortOrder, table.isPublished)],
);

export const clients = mysqlTable(
  "clients",
  {
    id: int("id").autoincrement().primaryKey(),
    nameAr: varchar("nameAr", { length: 180 }).notNull(),
    nameEn: varchar("nameEn", { length: 180 }).notNull(),
    logoMediaId: int("logoMediaId"),
    websiteUrl: varchar("websiteUrl", { length: 500 }),
    sortOrder: int("sortOrder").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("client_sort_idx").on(table.sortOrder, table.isActive)],
);

export const partners = mysqlTable(
  "partners",
  {
    id: int("id").autoincrement().primaryKey(),
    nameAr: varchar("nameAr", { length: 180 }).notNull(),
    nameEn: varchar("nameEn", { length: 180 }).notNull(),
    logoMediaId: int("logoMediaId"),
    websiteUrl: varchar("websiteUrl", { length: 500 }),
    sortOrder: int("sortOrder").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("partner_sort_idx").on(table.sortOrder, table.isActive)],
);

export const testimonials = mysqlTable(
  "testimonials",
  {
    id: int("id").autoincrement().primaryKey(),
    authorName: varchar("authorName", { length: 180 }).notNull(),
    authorRoleAr: varchar("authorRoleAr", { length: 180 }),
    authorRoleEn: varchar("authorRoleEn", { length: 180 }),
    quoteAr: text("quoteAr").notNull(),
    quoteEn: text("quoteEn").notNull(),
    avatarMediaId: int("avatarMediaId"),
    sourceUrl: varchar("sourceUrl", { length: 500 }),
    isVerified: boolean("isVerified").default(false).notNull(),
    isPublished: boolean("isPublished").default(false).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("testimonial_sort_idx").on(table.sortOrder, table.isPublished)],
);

export const faqs = mysqlTable(
  "faqs",
  {
    id: int("id").autoincrement().primaryKey(),
    questionAr: text("questionAr").notNull(),
    questionEn: text("questionEn").notNull(),
    answerAr: text("answerAr").notNull(),
    answerEn: text("answerEn").notNull(),
    category: varchar("category", { length: 120 }),
    sortOrder: int("sortOrder").default(0).notNull(),
    isPublished: boolean("isPublished").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("faq_sort_idx").on(table.sortOrder, table.isPublished)],
);

export const pages = mysqlTable(
  "pages",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 180 }).notNull().unique(),
    template: varchar("template", { length: 100 }).default("custom").notNull(),
    titleAr: varchar("titleAr", { length: 220 }).notNull(),
    titleEn: varchar("titleEn", { length: 220 }).notNull(),
    heroTitleAr: varchar("heroTitleAr", { length: 260 }),
    heroTitleEn: varchar("heroTitleEn", { length: 260 }),
    heroTextAr: text("heroTextAr"),
    heroTextEn: text("heroTextEn"),
    contentAr: json("contentAr").$type<Record<string, unknown>>(),
    contentEn: json("contentEn").$type<Record<string, unknown>>(),
    heroMediaId: int("heroMediaId"),
    seoTitleAr: varchar("seoTitleAr", { length: 180 }),
    seoTitleEn: varchar("seoTitleEn", { length: 180 }),
    seoDescriptionAr: varchar("seoDescriptionAr", { length: 320 }),
    seoDescriptionEn: varchar("seoDescriptionEn", { length: 320 }),
    seoKeywords: varchar("seoKeywords", { length: 500 }),
    showInNavigation: boolean("showInNavigation").default(false).notNull(),
    navigationOrder: int("navigationOrder").default(0).notNull(),
    status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("page_nav_idx").on(table.showInNavigation, table.navigationOrder),
    index("page_status_idx").on(table.status),
  ],
);

export const bookings = mysqlTable(
  "bookings",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 180 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    company: varchar("company", { length: 180 }),
    serviceId: int("serviceId"),
    projectType: varchar("projectType", { length: 180 }),
    requestedDate: varchar("requestedDate", { length: 80 }),
    budgetRange: varchar("budgetRange", { length: 100 }),
    message: text("message"),
    preferredLanguage: mysqlEnum("preferredLanguage", ["ar", "en"]).default("ar").notNull(),
    status: mysqlEnum("status", ["new", "contacted", "confirmed", "closed"]).default("new").notNull(),
    whatsappOpenedAt: timestamp("whatsappOpenedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("booking_status_idx").on(table.status, table.createdAt)],
);

export const contactRequests = mysqlTable(
  "contactRequests",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 180 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 320 }),
    subject: varchar("subject", { length: 240 }),
    message: text("message").notNull(),
    preferredLanguage: mysqlEnum("preferredLanguage", ["ar", "en"]).default("ar").notNull(),
    status: mysqlEnum("status", ["new", "read", "resolved"]).default("new").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("contact_status_idx").on(table.status, table.createdAt)],
);

export const instagramSyncConfigs = mysqlTable(
  "instagramSyncConfigs",
  {
    id: int("id").autoincrement().primaryKey(),
    facebookPageId: varchar("facebookPageId", { length: 64 }).notNull().unique(),
    instagramAccountId: varchar("instagramAccountId", { length: 64 }),
    instagramUsername: varchar("instagramUsername", { length: 120 }),
    cronExpression: varchar("cronExpression", { length: 80 }).default("0 0 */6 * * *").notNull(),
    scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
    isScheduleEnabled: boolean("isScheduleEnabled").default(false).notNull(),
    lastSyncedAt: timestamp("lastSyncedAt"),
    lastSyncStatus: varchar("lastSyncStatus", { length: 30 }),
    lastSyncError: text("lastSyncError"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("instagram_sync_task_idx").on(table.scheduleCronTaskUid)],
);

export const instagramVideos = mysqlTable(
  "instagramVideos",
  {
    id: int("id").autoincrement().primaryKey(),
    syncConfigId: int("syncConfigId").notNull(),
    sourceMediaId: varchar("sourceMediaId", { length: 80 }).notNull().unique(),
    shortcode: varchar("shortcode", { length: 120 }),
    permalink: varchar("permalink", { length: 1024 }).notNull(),
    caption: text("caption"),
    thumbnailUrl: varchar("thumbnailUrl", { length: 1024 }),
    mediaType: varchar("mediaType", { length: 80 }),
    mediaProductType: varchar("mediaProductType", { length: 80 }),
    status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    sourcePublishedAt: timestamp("sourcePublishedAt"),
    approvedById: int("approvedById"),
    approvedAt: timestamp("approvedAt"),
    firstSyncedAt: timestamp("firstSyncedAt").defaultNow().notNull(),
    lastSyncedAt: timestamp("lastSyncedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("instagram_video_config_status_idx").on(table.syncConfigId, table.status),
    index("instagram_video_published_idx").on(table.status, table.sourcePublishedAt),
  ],
);

export const siteSettings = mysqlTable(
  "siteSettings",
  {
    id: int("id").autoincrement().primaryKey(),
    key: varchar("key", { length: 120 }).notNull(),
    value: json("value").$type<Record<string, unknown>>().notNull(),
    updatedById: int("updatedById"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("setting_key_unique").on(table.key)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
