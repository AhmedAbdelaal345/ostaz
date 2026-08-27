ALTER TABLE `study_groups` MODIFY COLUMN `collectionPeriod` enum('monthly','term','per_lesson') NOT NULL DEFAULT 'monthly';--> statement-breakpoint
ALTER TABLE `students` ADD `joinedGroupAt` timestamp NULL;--> statement-breakpoint
UPDATE `students` SET `joinedGroupAt` = `createdAt` WHERE `joinedGroupAt` IS NULL;--> statement-breakpoint
ALTER TABLE `students` MODIFY COLUMN `joinedGroupAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;
