CREATE TABLE `year_work_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`termId` int NOT NULL,
	`studentId` int NOT NULL,
	`monthKey` varchar(7) NOT NULL,
	`homeWork` int NOT NULL DEFAULT 0,
	`activity` int NOT NULL DEFAULT 0,
	`weeklyEvaluation` int NOT NULL DEFAULT 0,
	`performanceTasks` int NOT NULL DEFAULT 0,
	`behavior` int NOT NULL DEFAULT 0,
	`attendance` int NOT NULL DEFAULT 0,
	`monthlyExam` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `year_work_scores_id` PRIMARY KEY(`id`),
	CONSTRAINT `year_work_scores_term_student_month` UNIQUE(`termId`,`studentId`,`monthKey`)
);
--> statement-breakpoint
CREATE TABLE `year_work_terms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`term` enum('first','second') NOT NULL,
	`grade` varchar(120) NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`monthsJson` text NOT NULL,
	`studentIdsJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `year_work_terms_id` PRIMARY KEY(`id`)
);
