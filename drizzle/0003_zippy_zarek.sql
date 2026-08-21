CREATE TABLE `behavior_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentId` int NOT NULL,
	`groupId` int,
	`category` enum('positive','warning','note') NOT NULL DEFAULT 'note',
	`title` varchar(180) NOT NULL,
	`note` text,
	`points` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `behavior_records_id` PRIMARY KEY(`id`)
);
