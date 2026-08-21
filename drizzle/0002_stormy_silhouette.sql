CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentId` int NOT NULL,
	`groupId` int,
	`title` varchar(180) NOT NULL,
	`period` enum('lesson','daily','weekly','monthly','term') NOT NULL,
	`score` decimal(6,2),
	`maxScore` decimal(6,2),
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentId` int NOT NULL,
	`groupId` int,
	`lessonDate` timestamp NOT NULL,
	`status` enum('present','late','absent') NOT NULL DEFAULT 'present',
	`note` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `center_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`centerId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','teacher','assistant') NOT NULL DEFAULT 'teacher',
	`permissionsJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `center_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `centers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`phone` varchar(32),
	`address` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `centers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentId` int,
	`groupId` int,
	`kind` enum('subscription','expense') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`dueDate` timestamp,
	`paidAt` timestamp,
	`description` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `financial_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `students` ADD `guardianName` varchar(160);--> statement-breakpoint
ALTER TABLE `students` ADD `guardianPhone` varchar(32);--> statement-breakpoint
ALTER TABLE `students` ADD `studentCode` varchar(80);