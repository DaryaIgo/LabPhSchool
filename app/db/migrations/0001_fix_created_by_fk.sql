ALTER TABLE `enrollments` DROP FOREIGN KEY `enrollments_created_by_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `local_users` DROP FOREIGN KEY `local_users_created_by_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `enrollments` MODIFY COLUMN `created_by` bigint unsigned;--> statement-breakpoint
ALTER TABLE `local_users` MODIFY COLUMN `created_by` bigint unsigned;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_created_by_local_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `local_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `local_users` ADD CONSTRAINT `local_users_created_by_local_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `local_users`(`id`) ON DELETE no action ON UPDATE no action;