CREATE TABLE `audit_log` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`actor_id` bigint unsigned NOT NULL,
	`actor_type` enum('user','local_user') NOT NULL,
	`action` varchar(50) NOT NULL,
	`resource` varchar(50) NOT NULL,
	`resource_id` bigint unsigned,
	`details` json,
	`ip_address` varchar(45),
	`user_agent` varchar(500),
	`success` boolean NOT NULL DEFAULT true,
	`error_message` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`local_user_id` bigint unsigned NOT NULL,
	`topic_id` bigint unsigned NOT NULL,
	`status` enum('active','completed','suspended') NOT NULL DEFAULT 'active',
	`enrolled_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp,
	`created_by` bigint unsigned NOT NULL,
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_enrollment` UNIQUE(`local_user_id`,`topic_id`)
);
--> statement-breakpoint
CREATE TABLE `lab_results` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`lab_id` bigint unsigned NOT NULL,
	`result` text,
	`grade` int,
	`status` enum('pending','completed') NOT NULL DEFAULT 'pending',
	`data` json,
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lab_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `labs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`short_desc` varchar(500),
	`theory` text,
	`icon_type` varchar(50),
	`topic_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `labs_id` PRIMARY KEY(`id`),
	CONSTRAINT `labs_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `local_users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`login` varchar(100) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`role_id` bigint unsigned NOT NULL DEFAULT 2,
	`created_by` bigint unsigned NOT NULL,
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`last_login_at` timestamp,
	CONSTRAINT `local_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `local_users_login_unique` UNIQUE(`login`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`resource` varchar(50) NOT NULL,
	`action` varchar(50) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `problem_types` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`subtopic_id` bigint unsigned NOT NULL,
	`order` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `problem_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `problem_types_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `problems` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`problem_type_id` bigint unsigned NOT NULL,
	`order` int NOT NULL,
	`level` enum('basic','intermediate','advanced') NOT NULL DEFAULT 'basic',
	`source` varchar(255),
	`condition` text NOT NULL,
	`given` text,
	`find` text,
	`solution` text NOT NULL,
	`answer` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `problems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`subtopic_id` bigint unsigned NOT NULL,
	`status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('video','reference','workbook','model') NOT NULL,
	`url` varchar(500),
	`tags` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`role_id` bigint unsigned NOT NULL,
	`permission_id` bigint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `role_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_role_permission` UNIQUE(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `student_progress` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`local_user_id` bigint unsigned NOT NULL,
	`subtopic_id` bigint unsigned NOT NULL,
	`theory_completed` enum('pending','completed') NOT NULL DEFAULT 'pending',
	`practice_completed` enum('pending','completed') NOT NULL DEFAULT 'pending',
	`lab_completed` enum('pending','completed') NOT NULL DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subtopics` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`topic_id` bigint unsigned NOT NULL,
	`order` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subtopics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`formula` varchar(500),
	`description` text,
	`short_desc` varchar(500),
	`color` varchar(20) DEFAULT '#2eff8c',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `topics_id` PRIMARY KEY(`id`),
	CONSTRAINT `topics_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`union_id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(320),
	`avatar` text,
	`role_id` bigint unsigned NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`last_sign_in_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_union_id_unique` UNIQUE(`union_id`)
);
--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_local_user_id_local_users_id_fk` FOREIGN KEY (`local_user_id`) REFERENCES `local_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_topic_id_topics_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lab_results` ADD CONSTRAINT `lab_results_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lab_results` ADD CONSTRAINT `lab_results_lab_id_labs_id_fk` FOREIGN KEY (`lab_id`) REFERENCES `labs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `labs` ADD CONSTRAINT `labs_topic_id_topics_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `local_users` ADD CONSTRAINT `local_users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `local_users` ADD CONSTRAINT `local_users_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `problem_types` ADD CONSTRAINT `problem_types_subtopic_id_subtopics_id_fk` FOREIGN KEY (`subtopic_id`) REFERENCES `subtopics`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `problems` ADD CONSTRAINT `problems_problem_type_id_problem_types_id_fk` FOREIGN KEY (`problem_type_id`) REFERENCES `problem_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `progress` ADD CONSTRAINT `progress_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `progress` ADD CONSTRAINT `progress_subtopic_id_subtopics_id_fk` FOREIGN KEY (`subtopic_id`) REFERENCES `subtopics`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_progress` ADD CONSTRAINT `student_progress_local_user_id_local_users_id_fk` FOREIGN KEY (`local_user_id`) REFERENCES `local_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_progress` ADD CONSTRAINT `student_progress_subtopic_id_subtopics_id_fk` FOREIGN KEY (`subtopic_id`) REFERENCES `subtopics`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subtopics` ADD CONSTRAINT `subtopics_topic_id_topics_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_actor_idx` ON `audit_log` (`actor_id`,`actor_type`);--> statement-breakpoint
CREATE INDEX `audit_resource_idx` ON `audit_log` (`resource`,`resource_id`);--> statement-breakpoint
CREATE INDEX `audit_created_at_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `enrollment_local_user_idx` ON `enrollments` (`local_user_id`);--> statement-breakpoint
CREATE INDEX `enrollment_topic_idx` ON `enrollments` (`topic_id`);--> statement-breakpoint
CREATE INDEX `local_user_status_idx` ON `local_users` (`status`);--> statement-breakpoint
CREATE INDEX `local_user_created_by_idx` ON `local_users` (`created_by`);--> statement-breakpoint
CREATE INDEX `resource_action_idx` ON `permissions` (`resource`,`action`);