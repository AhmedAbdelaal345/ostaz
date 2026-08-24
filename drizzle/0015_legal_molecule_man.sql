CREATE TABLE `learning_materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`groupId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`materialType` enum('audio','image','pdf') NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(512) NOT NULL,
	`mimeType` varchar(80) NOT NULL,
	`sizeBytes` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_materials_id` PRIMARY KEY(`id`)
);
