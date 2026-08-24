CREATE TABLE `automation_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kind` varchar(80) NOT NULL,
	`schedule_cron_task_uid` varchar(65),
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automation_schedules_id` PRIMARY KEY(`id`),
	CONSTRAINT `automation_schedules_kind_unique` UNIQUE(`kind`),
	CONSTRAINT `automation_schedules_schedule_cron_task_uid_unique` UNIQUE(`schedule_cron_task_uid`)
);
