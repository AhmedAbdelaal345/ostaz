ALTER TABLE `study_groups` ADD `grade` varchar(120);--> statement-breakpoint
ALTER TABLE `study_groups` ADD `isPinned` boolean DEFAULT false NOT NULL;