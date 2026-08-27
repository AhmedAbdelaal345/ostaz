CREATE TABLE `group_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`groupId` int NOT NULL,
	`body` varchar(500) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`refreshedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `group_notes_id` PRIMARY KEY(`id`)
);
