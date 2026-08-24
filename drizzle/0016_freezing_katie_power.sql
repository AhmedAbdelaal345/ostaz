CREATE TABLE `personal_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`note` text,
	`remindAt` timestamp NOT NULL,
	`recurrence` enum('once','daily','weekly') NOT NULL DEFAULT 'once',
	`completed` boolean NOT NULL DEFAULT false,
	`lastDeliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personal_reminders_id` PRIMARY KEY(`id`)
);
