ALTER TABLE `weekly_quizzes` ADD `workspace` enum('school','center','online') DEFAULT 'center' NOT NULL;--> statement-breakpoint
UPDATE `weekly_quizzes` AS quiz
INNER JOIN `study_groups` AS study_group
  ON study_group.`id` = quiz.`groupId` AND study_group.`userId` = quiz.`userId`
SET quiz.`workspace` = study_group.`workspace`;--> statement-breakpoint
CREATE INDEX `weekly_quizzes_user_workspace_starts_at` ON `weekly_quizzes` (`userId`,`workspace`,`startsAt`);
