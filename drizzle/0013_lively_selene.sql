CREATE TABLE `lesson_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`schedule_cron_task_uid` varchar(65),
	`last_reminder_key` varchar(180),
	`last_delivered_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lesson_reminders_id` PRIMARY KEY(`id`),
	CONSTRAINT `lesson_reminders_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `lesson_reminders_schedule_cron_task_uid_unique` UNIQUE(`schedule_cron_task_uid`)
);
