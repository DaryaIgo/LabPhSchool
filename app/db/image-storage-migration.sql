CREATE TABLE `images` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`filename` varchar(255) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`data` longtext NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `images_id` PRIMARY KEY(`id`)
);
