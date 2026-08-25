CREATE TABLE `student_subscription_credits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentId` int NOT NULL,
	`rewardRedemptionId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('available','applied') NOT NULL DEFAULT 'available',
	`appliedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_subscription_credits_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_subscription_credits_rewardRedemptionId_unique` UNIQUE(`rewardRedemptionId`)
);
