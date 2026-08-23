CREATE TABLE `teacher_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phone` varchar(32) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teacher_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `teacher_accounts_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `teacher_accounts_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
ALTER TABLE `students` ADD `age` int;--> statement-breakpoint
ALTER TABLE `students` ADD `grade` varchar(120);--> statement-breakpoint
ALTER TABLE `students` ADD `avatarUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `teacher_profiles` ADD `avatarUrl` varchar(512);