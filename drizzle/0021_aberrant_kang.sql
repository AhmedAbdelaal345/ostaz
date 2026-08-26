ALTER TABLE `student_accounts` DROP INDEX `student_accounts_phone_unique`;--> statement-breakpoint
ALTER TABLE `student_accounts` ADD `userId` int;--> statement-breakpoint
UPDATE `student_accounts` AS account INNER JOIN `students` AS student ON student.`id` = account.`studentId` SET account.`userId` = student.`userId`;--> statement-breakpoint
ALTER TABLE `student_accounts` MODIFY `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `student_accounts` ADD CONSTRAINT `student_accounts_user_phone_unique` UNIQUE(`userId`,`phone`);
