CREATE TABLE `student_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`phone` varchar(32) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_accounts_studentId_unique` UNIQUE(`studentId`),
	CONSTRAINT `student_accounts_phone_unique` UNIQUE(`phone`)
);
