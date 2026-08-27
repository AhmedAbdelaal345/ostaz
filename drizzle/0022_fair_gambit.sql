ALTER TABLE `assessments` ADD `workspace` enum('school','center','online') DEFAULT 'center' NOT NULL;--> statement-breakpoint
ALTER TABLE `attendance` ADD `workspace` enum('school','center','online') DEFAULT 'center' NOT NULL;--> statement-breakpoint
ALTER TABLE `behavior_records` ADD `workspace` enum('school','center','online') DEFAULT 'center' NOT NULL;--> statement-breakpoint
ALTER TABLE `financial_transactions` ADD `workspace` enum('school','center','online') DEFAULT 'center' NOT NULL;--> statement-breakpoint
ALTER TABLE `students` ADD `workspace` enum('school','center','online') DEFAULT 'center' NOT NULL;--> statement-breakpoint
ALTER TABLE `study_groups` ADD `workspace` enum('school','center','online') DEFAULT 'center' NOT NULL;--> statement-breakpoint
UPDATE `study_groups` SET `workspace` = CASE `place` WHEN 'مدرسة' THEN 'school' WHEN 'أونلاين' THEN 'online' ELSE 'center' END;--> statement-breakpoint
UPDATE `students` INNER JOIN `study_groups` ON `students`.`groupId` = `study_groups`.`id` SET `students`.`workspace` = `study_groups`.`workspace`;--> statement-breakpoint
UPDATE `attendance` INNER JOIN `study_groups` ON `attendance`.`groupId` = `study_groups`.`id` SET `attendance`.`workspace` = `study_groups`.`workspace`;--> statement-breakpoint
UPDATE `financial_transactions` INNER JOIN `study_groups` ON `financial_transactions`.`groupId` = `study_groups`.`id` SET `financial_transactions`.`workspace` = `study_groups`.`workspace`;--> statement-breakpoint
UPDATE `assessments` INNER JOIN `study_groups` ON `assessments`.`groupId` = `study_groups`.`id` SET `assessments`.`workspace` = `study_groups`.`workspace`;--> statement-breakpoint
UPDATE `behavior_records` INNER JOIN `study_groups` ON `behavior_records`.`groupId` = `study_groups`.`id` SET `behavior_records`.`workspace` = `study_groups`.`workspace`;
