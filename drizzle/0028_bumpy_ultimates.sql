ALTER TABLE `push_subscriptions` ADD `accountType` enum('teacher','student') DEFAULT 'teacher' NOT NULL;--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD `studentId` int;--> statement-breakpoint
CREATE INDEX `push_subscriptions_user_student_idx` ON `push_subscriptions` (`userId`,`studentId`);