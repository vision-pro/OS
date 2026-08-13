CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleAr` varchar(240) NOT NULL,
	`titleEn` varchar(240) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`achievementDate` varchar(60),
	`mediaId` int,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`company` varchar(180),
	`serviceId` int,
	`projectType` varchar(180),
	`requestedDate` varchar(80),
	`budgetRange` varchar(100),
	`message` text,
	`preferredLanguage` enum('ar','en') NOT NULL DEFAULT 'ar',
	`status` enum('new','contacted','confirmed','closed') NOT NULL DEFAULT 'new',
	`whatsappOpenedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(180) NOT NULL,
	`nameEn` varchar(180) NOT NULL,
	`logoMediaId` int,
	`websiteUrl` varchar(500),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contactRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`phone` varchar(50),
	`email` varchar(320),
	`subject` varchar(240),
	`message` text NOT NULL,
	`preferredLanguage` enum('ar','en') NOT NULL DEFAULT 'ar',
	`status` enum('new','read','resolved') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contactRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionAr` text NOT NULL,
	`questionEn` text NOT NULL,
	`answerAr` text NOT NULL,
	`answerEn` text NOT NULL,
	`category` varchar(120),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mediaAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`sizeBytes` int NOT NULL,
	`kind` enum('image','video','document','other') NOT NULL DEFAULT 'image',
	`altAr` varchar(300),
	`altEn` varchar(300),
	`createdById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mediaAssets_id` PRIMARY KEY(`id`),
	CONSTRAINT `mediaAssets_storageKey_unique` UNIQUE(`storageKey`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`template` varchar(100) NOT NULL DEFAULT 'custom',
	`titleAr` varchar(220) NOT NULL,
	`titleEn` varchar(220) NOT NULL,
	`heroTitleAr` varchar(260),
	`heroTitleEn` varchar(260),
	`heroTextAr` text,
	`heroTextEn` text,
	`contentAr` json,
	`contentEn` json,
	`heroMediaId` int,
	`seoTitleAr` varchar(180),
	`seoTitleEn` varchar(180),
	`seoDescriptionAr` varchar(320),
	`seoDescriptionEn` varchar(320),
	`seoKeywords` varchar(500),
	`showInNavigation` boolean NOT NULL DEFAULT false,
	`navigationOrder` int NOT NULL DEFAULT 0,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(180) NOT NULL,
	`nameEn` varchar(180) NOT NULL,
	`logoMediaId` int,
	`websiteUrl` varchar(500),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolioCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`titleAr` varchar(180) NOT NULL,
	`titleEn` varchar(180) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolioCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `portfolioCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int,
	`slug` varchar(160) NOT NULL,
	`titleAr` varchar(250) NOT NULL,
	`titleEn` varchar(250) NOT NULL,
	`summaryAr` text,
	`summaryEn` text,
	`descriptionAr` text,
	`descriptionEn` text,
	`clientName` varchar(250),
	`projectDate` varchar(50),
	`coverMediaId` int,
	`mediaIds` json DEFAULT ('[]'),
	`contentAr` json,
	`contentEn` json,
	`seoTitleAr` varchar(180),
	`seoTitleEn` varchar(180),
	`seoDescriptionAr` varchar(320),
	`seoDescriptionEn` varchar(320),
	`seoKeywords` varchar(500),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`isFeatured` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`titleAr` varchar(180) NOT NULL,
	`titleEn` varchar(180) NOT NULL,
	`summaryAr` text,
	`summaryEn` text,
	`descriptionAr` text,
	`descriptionEn` text,
	`icon` varchar(80),
	`coverMediaId` int,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(120) NOT NULL,
	`value` json NOT NULL,
	`updatedById` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `setting_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorName` varchar(180) NOT NULL,
	`authorRoleAr` varchar(180),
	`authorRoleEn` varchar(180),
	`quoteAr` text NOT NULL,
	`quoteEn` text NOT NULL,
	`avatarMediaId` int,
	`sourceUrl` varchar(500),
	`isVerified` boolean NOT NULL DEFAULT false,
	`isPublished` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `achievement_sort_idx` ON `achievements` (`sortOrder`,`isPublished`);--> statement-breakpoint
CREATE INDEX `booking_status_idx` ON `bookings` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `client_sort_idx` ON `clients` (`sortOrder`,`isActive`);--> statement-breakpoint
CREATE INDEX `contact_status_idx` ON `contactRequests` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `faq_sort_idx` ON `faqs` (`sortOrder`,`isPublished`);--> statement-breakpoint
CREATE INDEX `media_created_by_idx` ON `mediaAssets` (`createdById`);--> statement-breakpoint
CREATE INDEX `page_nav_idx` ON `pages` (`showInNavigation`,`navigationOrder`);--> statement-breakpoint
CREATE INDEX `page_status_idx` ON `pages` (`status`);--> statement-breakpoint
CREATE INDEX `partner_sort_idx` ON `partners` (`sortOrder`,`isActive`);--> statement-breakpoint
CREATE INDEX `category_sort_idx` ON `portfolioCategories` (`sortOrder`,`isActive`);--> statement-breakpoint
CREATE INDEX `project_category_idx` ON `projects` (`categoryId`);--> statement-breakpoint
CREATE INDEX `project_featured_idx` ON `projects` (`isFeatured`,`status`);--> statement-breakpoint
CREATE INDEX `project_cover_idx` ON `projects` (`coverMediaId`);--> statement-breakpoint
CREATE INDEX `service_sort_idx` ON `services` (`sortOrder`,`isActive`);--> statement-breakpoint
CREATE INDEX `testimonial_sort_idx` ON `testimonials` (`sortOrder`,`isPublished`);