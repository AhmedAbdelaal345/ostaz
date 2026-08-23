CREATE TABLE `change_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` enum('student','group','attendance','finance','assessment','settings') NOT NULL,
	`action` enum('created','updated','deleted','recorded','settled') NOT NULL,
	`entityName` varchar(180) NOT NULL,
	`details` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `change_logs_id` PRIMARY KEY(`id`)
);
