CREATE TABLE `assignment_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assignmentId` int NOT NULL,
	`studentId` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` varchar(512) NOT NULL,
	`mimeType` varchar(80) NOT NULL,
	`reviewNote` text,
	`score` decimal(6,2),
	`status` enum('submitted','reviewed') NOT NULL DEFAULT 'submitted',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `assignment_submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `assignment_submissions_assignment_student` UNIQUE(`assignmentId`,`studentId`)
);
--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`groupId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`instructions` text,
	`dueAt` timestamp,
	`status` enum('draft','published','closed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `center_rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`capacity` int NOT NULL,
	`seatMapJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `center_rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`groupId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`audience` enum('students','guardians','all') NOT NULL DEFAULT 'all',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_discussion_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`groupId` int NOT NULL,
	`authorType` enum('teacher','assistant','student') NOT NULL,
	`authorStudentId` int,
	`body` text NOT NULL,
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_discussion_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parent_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phone` varchar(32) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parent_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `parent_accounts_user_phone` UNIQUE(`userId`,`phone`)
);
--> statement-breakpoint
CREATE TABLE `parent_student_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentId` int NOT NULL,
	`studentId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `parent_student_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `parent_student_links_parent_student` UNIQUE(`parentId`,`studentId`)
);
--> statement-breakpoint
CREATE TABLE `quiz_focus_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizAttemptId` int NOT NULL,
	`studentId` int NOT NULL,
	`eventType` enum('visibility_hidden','window_blur','fullscreen_exit') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_focus_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seat_reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`groupId` int NOT NULL,
	`roomId` int NOT NULL,
	`studentId` int NOT NULL,
	`sessionAt` timestamp NOT NULL,
	`seatNumber` varchar(24) NOT NULL,
	`status` enum('reserved','cancelled','attended') NOT NULL DEFAULT 'reserved',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seat_reservations_id` PRIMARY KEY(`id`),
	CONSTRAINT `seat_reservations_student_session` UNIQUE(`studentId`,`sessionAt`),
	CONSTRAINT `seat_reservations_room_seat_session` UNIQUE(`roomId`,`seatNumber`,`sessionAt`)
);
--> statement-breakpoint
CREATE TABLE `store_order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`titleSnapshot` varchar(180) NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL,
	CONSTRAINT `store_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `store_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentId` int NOT NULL,
	`orderNumber` varchar(32) NOT NULL,
	`fulfillment` enum('pickup','delivery') NOT NULL,
	`deliveryAddress` text,
	`totalAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','confirmed','ready','out_for_delivery','fulfilled','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `store_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `store_orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `store_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`stockQuantity` int NOT NULL DEFAULT 0,
	`fulfillment` enum('pickup','delivery','both') NOT NULL DEFAULT 'pickup',
	`imageUrl` varchar(512),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `store_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_device_bindings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`deviceIdHash` varchar(128) NOT NULL,
	`deviceName` varchar(220) NOT NULL,
	`status` enum('active','release_requested') NOT NULL DEFAULT 'active',
	`releaseRequestedAt` timestamp,
	`boundAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_device_bindings_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_device_bindings_studentId_unique` UNIQUE(`studentId`)
);
--> statement-breakpoint
CREATE TABLE `video_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`groupId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text,
	`sourceType` enum('upload','external','live') NOT NULL,
	`storageKey` varchar(512),
	`storageUrl` varchar(512),
	`externalUrl` varchar(1024),
	`accessCodeHash` varchar(255),
	`watermarkEnabled` boolean NOT NULL DEFAULT true,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallet_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentId` int NOT NULL,
	`source` enum('kiosk_code','manual','store_order','adjustment') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`note` varchar(320),
	`referenceKey` varchar(180),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_ledger_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallet_ledger_referenceKey_unique` UNIQUE(`referenceKey`)
);
--> statement-breakpoint
CREATE TABLE `wallet_topup_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`codeHash` varchar(128) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('unused','redeemed','void') NOT NULL DEFAULT 'unused',
	`redeemedByStudentId` int,
	`redeemedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_topup_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallet_topup_codes_codeHash_unique` UNIQUE(`codeHash`)
);
