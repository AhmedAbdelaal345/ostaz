CREATE TABLE `student_daily_followups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workspace` enum('school','center','online') NOT NULL DEFAULT 'center',
	`studentId` int NOT NULL,
	`groupId` int NOT NULL,
	`followupDate` timestamp NOT NULL,
	`recitation` enum('weak','good','very_good','excellent'),
	`homework` enum('weak','good','very_good','excellent'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_daily_followups_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_followup_day_unique` UNIQUE(`userId`,`workspace`,`studentId`,`groupId`,`followupDate`)
);
--> statement-breakpoint
CREATE INDEX `student_followup_group_day_idx` ON `student_daily_followups` (`userId`,`workspace`,`groupId`,`followupDate`);