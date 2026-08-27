CREATE INDEX `attendance_user_workspace_lesson_idx` ON `attendance` (`userId`,`workspace`,`lessonDate`);--> statement-breakpoint
CREATE INDEX `financial_user_workspace_created_idx` ON `financial_transactions` (`userId`,`workspace`,`createdAt`);--> statement-breakpoint
CREATE INDEX `students_user_workspace_idx` ON `students` (`userId`,`workspace`);--> statement-breakpoint
CREATE INDEX `students_user_workspace_group_idx` ON `students` (`userId`,`workspace`,`groupId`);--> statement-breakpoint
CREATE INDEX `study_groups_user_workspace_idx` ON `study_groups` (`userId`,`workspace`);