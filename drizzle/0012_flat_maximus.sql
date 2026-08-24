CREATE TABLE `account_sessions` (
	`id` varchar(64) NOT NULL,
	`accountType` enum('teacher','student') NOT NULL,
	`accountId` int NOT NULL,
	`deviceName` varchar(220) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	CONSTRAINT `account_sessions_id` PRIMARY KEY(`id`)
);
