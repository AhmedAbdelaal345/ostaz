ALTER TABLE `students` ADD `paidAmount` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `study_groups` ADD `collectionPeriod` enum('monthly','term') DEFAULT 'monthly' NOT NULL;