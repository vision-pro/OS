CREATE TABLE `instagramSyncConfigs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facebookPageId` varchar(64) NOT NULL,
	`instagramAccountId` varchar(64),
	`instagramUsername` varchar(120),
	`cronExpression` varchar(80) NOT NULL DEFAULT '0 0 */6 * * *',
	`scheduleCronTaskUid` varchar(65),
	`isScheduleEnabled` boolean NOT NULL DEFAULT false,
	`lastSyncedAt` timestamp,
	`lastSyncStatus` varchar(30),
	`lastSyncError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instagramSyncConfigs_id` PRIMARY KEY(`id`),
	CONSTRAINT `instagramSyncConfigs_facebookPageId_unique` UNIQUE(`facebookPageId`)
);
--> statement-breakpoint
CREATE TABLE `instagramVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`syncConfigId` int NOT NULL,
	`sourceMediaId` varchar(80) NOT NULL,
	`shortcode` varchar(120),
	`permalink` varchar(1024) NOT NULL,
	`caption` text,
	`thumbnailUrl` varchar(1024),
	`mediaType` varchar(80),
	`mediaProductType` varchar(80),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`isFeatured` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`sourcePublishedAt` timestamp,
	`approvedById` int,
	`approvedAt` timestamp,
	`firstSyncedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSyncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instagramVideos_id` PRIMARY KEY(`id`),
	CONSTRAINT `instagramVideos_sourceMediaId_unique` UNIQUE(`sourceMediaId`)
);
--> statement-breakpoint
CREATE INDEX `instagram_sync_task_idx` ON `instagramSyncConfigs` (`scheduleCronTaskUid`);--> statement-breakpoint
CREATE INDEX `instagram_video_config_status_idx` ON `instagramVideos` (`syncConfigId`,`status`);--> statement-breakpoint
CREATE INDEX `instagram_video_published_idx` ON `instagramVideos` (`status`,`sourcePublishedAt`);