-- Create roles
INSERT INTO `roles` (`name`, `description`) VALUES
('admin', 'Administrator with full access'),
('student', 'Student user'),
('teacher', 'Teacher user');

-- Create admin user (password: admin123)
INSERT INTO `local_users` (`login`, `password_hash`, `name`, `role_id`, `status`, `created_at`, `updated_at`) VALUES
('admin', '$2b$12$0n1i95sq8u8V1Sh2y3BCdu0GrQLOFC/ttaINwtXK3qht3qS5jPTlC', 'Administrator', 1, 'active', NOW(), NOW());
