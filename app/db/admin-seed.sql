-- Create roles
INSERT INTO `roles` (`name`, `description`) VALUES
('admin', 'Administrator with full access'),
('student', 'Student user'),
('teacher', 'Teacher user');

-- Create admin user (password matches production)
INSERT INTO `local_users` (`login`, `password_hash`, `name`, `role_id`, `status`, `created_at`, `updated_at`) VALUES
('admin', '$2b$12$XdS0r9lEAimMKx.pxFfCIeYZa/dD/MuYs.8Cw1Oajh1w88kDdYcN.', 'Administrator', 1, 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `password_hash` = VALUES(`password_hash`),
  `updated_at` = NOW();
