CREATE TABLE `reward_redemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentId` int NOT NULL,
	`rewardType` enum('next_subscription_discount','free_booklet','gift','app_subscription_discount') NOT NULL,
	`pointsCost` int NOT NULL,
	`discountAmount` decimal(10,2),
	`note` varchar(320),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reward_redemptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_point_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentId` int NOT NULL,
	`source` enum('attendance','homework','high_score','redemption','manual') NOT NULL,
	`points` int NOT NULL,
	`note` varchar(320),
	`referenceKey` varchar(180),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_point_ledger_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_point_ledger_referenceKey_unique` UNIQUE(`referenceKey`)
);
