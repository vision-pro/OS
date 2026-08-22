ALTER TABLE `projects` ADD `posterMediaId` int;--> statement-breakpoint
ALTER TABLE `projects` ADD `displayLocation` enum('grid','carousel','both') DEFAULT 'both' NOT NULL;--> statement-breakpoint
CREATE INDEX `project_poster_idx` ON `projects` (`posterMediaId`);