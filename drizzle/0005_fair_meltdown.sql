CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizId` int NOT NULL,
	`userId` int NOT NULL,
	`studentId` int NOT NULL,
	`answersJson` text NOT NULL,
	`score` decimal(8,2),
	`status` enum('submitted','graded') NOT NULL DEFAULT 'submitted',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`gradedAt` timestamp,
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`groupId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`instructions` text,
	`questionType` enum('mcq','true_false','essay') NOT NULL,
	`questionsJson` text NOT NULL,
	`maxScore` decimal(8,2) NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weekly_quizzes_id` PRIMARY KEY(`id`)
);
