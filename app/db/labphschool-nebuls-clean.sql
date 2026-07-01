-- MySQL dump 10.13  Distrib 9.6.0, for macos26.4 (arm64)
--
-- Host: localhost    Database: labphschool
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `login` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  `status` enum('active','inactive','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `avatar` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `last_login_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `admin_users_login_unique` (`login`),
  KEY `admin_user_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assigned_jupyter_notebooks`
--

DROP TABLE IF EXISTS `assigned_jupyter_notebooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assigned_jupyter_notebooks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `enrollment_id` bigint unsigned NOT NULL,
  `local_user_id` bigint unsigned NOT NULL,
  `notebook_id` bigint unsigned NOT NULL,
  `order` int NOT NULL DEFAULT '1',
  `status` enum('assigned','submitted','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'assigned',
  `grade` int DEFAULT NULL,
  `student_colab_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `teacher_comment` text COLLATE utf8mb4_unicode_ci,
  `assigned_by` bigint unsigned DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT (now()),
  `submitted_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `unique_jupyter_notebook_assignment` (`enrollment_id`,`notebook_id`),
  KEY `assigned_jupyter_notebook_enrollment_idx` (`enrollment_id`),
  KEY `assigned_jupyter_notebook_local_user_idx` (`local_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assigned_lab_works`
--

DROP TABLE IF EXISTS `assigned_lab_works`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assigned_lab_works` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `enrollment_id` bigint unsigned NOT NULL,
  `local_user_id` bigint unsigned NOT NULL,
  `lab_work_id` bigint unsigned NOT NULL,
  `order` int NOT NULL DEFAULT '1',
  `status` enum('assigned','submitted','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'assigned',
  `grade` int DEFAULT NULL,
  `assigned_by` bigint unsigned DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT (now()),
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `teacher_comment` text COLLATE utf8mb4_unicode_ci,
  `submitted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `unique_assignment` (`enrollment_id`,`lab_work_id`),
  KEY `assigned_lab_work_enrollment_idx` (`enrollment_id`),
  KEY `assigned_lab_work_local_user_idx` (`local_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assigned_problems`
--

DROP TABLE IF EXISTS `assigned_problems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assigned_problems` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `enrollment_id` bigint unsigned NOT NULL,
  `local_user_id` bigint unsigned NOT NULL,
  `problem_id` bigint unsigned NOT NULL,
  `order` int NOT NULL DEFAULT '1',
  `status` enum('assigned','submitted','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'assigned',
  `grade` int DEFAULT NULL,
  `assigned_by` bigint unsigned DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT (now()),
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `student_answer` text COLLATE utf8mb4_unicode_ci,
  `solution_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `teacher_comment` text COLLATE utf8mb4_unicode_ci,
  `solution_image_delete_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `unique_problem_assignment` (`enrollment_id`,`problem_id`),
  KEY `assigned_problem_enrollment_idx` (`enrollment_id`),
  KEY `assigned_problem_local_user_idx` (`local_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `actor_id` bigint unsigned NOT NULL,
  `actor_type` enum('admin_user','local_user') COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_id` bigint unsigned DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `success` tinyint(1) NOT NULL DEFAULT '1',
  `error_message` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `audit_actor_idx` (`actor_id`,`actor_type`),
  KEY `audit_resource_idx` (`resource`,`resource_id`),
  KEY `audit_created_at_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `local_user_id` bigint unsigned NOT NULL,
  `topic_node_id` bigint unsigned NOT NULL,
  `status` enum('active','completed','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `current_subtopic_node_id` bigint unsigned DEFAULT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT (now()),
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `unique_enrollment` (`local_user_id`,`topic_node_id`),
  KEY `enrollment_local_user_idx` (`local_user_id`),
  KEY `enrollment_topic_node_idx` (`topic_node_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `images`
--

DROP TABLE IF EXISTS `images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jupyter_notebook_access`
--

DROP TABLE IF EXISTS `jupyter_notebook_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jupyter_notebook_access` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `notebook_id` bigint unsigned NOT NULL,
  `local_user_id` bigint unsigned NOT NULL,
  `granted_by` bigint unsigned DEFAULT NULL,
  `granted_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `unique_jupyter_access` (`notebook_id`,`local_user_id`),
  CONSTRAINT `jupyter_notebook_access_notebook_id_jupyter_notebooks_id_fk` FOREIGN KEY (`notebook_id`) REFERENCES `jupyter_notebooks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jupyter_notebooks`
--

DROP TABLE IF EXISTS `jupyter_notebooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jupyter_notebooks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `subtopic_node_id` bigint unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab_analytics`
--

DROP TABLE IF EXISTS `lab_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_analytics` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lab_work_id` bigint unsigned NOT NULL,
  `total_runs` int NOT NULL DEFAULT '0',
  `avg_duration` int DEFAULT NULL,
  `completion_rate` int DEFAULT '0',
  `avg_results` json DEFAULT NULL,
  `popular_rank` int DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `lab_analytics_lab_work_id_lab_works_id_fk` (`lab_work_id`),
  CONSTRAINT `lab_analytics_lab_work_id_lab_works_id_fk` FOREIGN KEY (`lab_work_id`) REFERENCES `lab_works` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab_blocks`
--

DROP TABLE IF EXISTS `lab_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_blocks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `lab_work_id` bigint unsigned NOT NULL,
  `order` int NOT NULL,
  `type` enum('theory','simulation','table','graphs','questions','test','conclusion','equipment','goal') NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text,
  `config` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `lab_blocks_lab_work_id_lab_works_id_fk` (`lab_work_id`),
  CONSTRAINT `lab_blocks_lab_work_id_lab_works_id_fk` FOREIGN KEY (`lab_work_id`) REFERENCES `lab_works` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=218 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab_categories`
--

DROP TABLE IF EXISTS `lab_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `grade` varchar(50) DEFAULT NULL,
  `description` text,
  `short_desc` varchar(500) DEFAULT NULL,
  `color` varchar(20) DEFAULT '#2eff8c',
  `icon_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `lab_categories_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab_progress`
--

DROP TABLE IF EXISTS `lab_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_progress` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `local_user_id` bigint unsigned NOT NULL,
  `lab_work_id` bigint unsigned NOT NULL,
  `mode` enum('training','self') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'self',
  `status` enum('not_started','in_progress','completed','submitted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_started',
  `data` json DEFAULT NULL,
  `measurements` json DEFAULT NULL,
  `conclusion` text COLLATE utf8mb4_unicode_ci,
  `grade` int DEFAULT NULL,
  `teacher_comment` text COLLATE utf8mb4_unicode_ci,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab_subcategories`
--

DROP TABLE IF EXISTS `lab_subcategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_subcategories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `order` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `lab_subcategories_category_id_lab_categories_id_fk` (`category_id`),
  CONSTRAINT `lab_subcategories_category_id_lab_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `lab_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab_works`
--

DROP TABLE IF EXISTS `lab_works`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_works` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `order` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `goal` text,
  `theory` text,
  `equipment` text,
  `instruction` text,
  `conclusion_template` text,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `subcategory_id` bigint unsigned DEFAULT NULL,
  `topic_node_id` bigint unsigned DEFAULT NULL,
  `simulation_slug` varchar(255) DEFAULT NULL,
  `card_type` enum('own','external') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `lab_works_slug_unique` (`slug`),
  KEY `lab_works_category_id_lab_categories_id_fk` (`category_id`),
  KEY `lab_works_subcategory_id_lab_subcategories_id_fk` (`subcategory_id`),
  CONSTRAINT `lab_works_category_id_lab_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `lab_categories` (`id`),
  CONSTRAINT `lab_works_subcategory_id_lab_subcategories_id_fk` FOREIGN KEY (`subcategory_id`) REFERENCES `lab_subcategories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `local_users`
--

DROP TABLE IF EXISTS `local_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `local_users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `login` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` bigint unsigned NOT NULL DEFAULT '2',
  `created_by` bigint unsigned DEFAULT NULL,
  `status` enum('active','inactive','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `avatar` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `last_login_at` timestamp NULL DEFAULT NULL,
  `moon_comment` text COLLATE utf8mb4_unicode_ci,
  `moon_comment_updated_at` timestamp NULL DEFAULT NULL,
  `moon_comment_read_at` timestamp NULL DEFAULT NULL,
  `moon_comment_first_opened_at` timestamp NULL DEFAULT NULL,
  `homework_comments_read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `local_users_login_unique` (`login`),
  KEY `local_users_role_id_roles_id_fk` (`role_id`),
  KEY `local_user_status_idx` (`status`),
  KEY `local_user_created_by_idx` (`created_by`),
  CONSTRAINT `local_users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `local_user_id` bigint unsigned NOT NULL,
  `type` enum('jupyter_notebook','lab','problem','general') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `resource_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `page_visits`
--

DROP TABLE IF EXISTS `page_visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_visits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referrer` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `local_user_id` bigint unsigned DEFAULT NULL,
  `visited_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `page_visits_path_idx` (`path`),
  KEY `page_visits_visited_at_idx` (`visited_at`),
  KEY `page_visits_local_user_idx` (`local_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `permissions_name_unique` (`name`),
  KEY `resource_action_idx` (`resource`,`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `problem_categories`
--

DROP TABLE IF EXISTS `problem_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '#ffcb3d',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `problem_categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `problem_subcategories`
--

DROP TABLE IF EXISTS `problem_subcategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem_subcategories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `order` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `problem_subcategories_slug_unique` (`slug`),
  KEY `problem_subcategories_category_id_problem_categories_id_fk` (`category_id`),
  CONSTRAINT `problem_subcategories_category_id_problem_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `problem_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `problems`
--

DROP TABLE IF EXISTS `problems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problems` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `subcategory_id` bigint unsigned DEFAULT NULL,
  `order` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `difficulty` enum('easy','medium','hard') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condition` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `solution` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('draft','published') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `problems_slug_unique` (`slug`),
  KEY `problems_category_id_problem_categories_id_fk` (`category_id`),
  KEY `problems_subcategory_id_problem_subcategories_id_fk` (`subcategory_id`),
  CONSTRAINT `problems_category_id_problem_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `problem_categories` (`id`),
  CONSTRAINT `problems_subcategory_id_problem_subcategories_id_fk` FOREIGN KEY (`subcategory_id`) REFERENCES `problem_subcategories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resources` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('video','reference','workbook','model') COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint unsigned NOT NULL,
  `permission_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `unique_role_permission` (`role_id`,`permission_id`),
  KEY `role_permissions_permission_id_permissions_id_fk` (`permission_id`),
  CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`),
  CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `simulations`
--

DROP TABLE IF EXISTS `simulations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `simulations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `component_ref` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `kind` enum('own','external') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'own',
  `is_dynamic` tinyint(1) NOT NULL DEFAULT '0',
  `source` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `simulations_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=268 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_links`
--

DROP TABLE IF EXISTS `student_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_links` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `local_user_id` bigint unsigned NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `platform_key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `display_order` int NOT NULL DEFAULT '1',
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `student_link_local_user_idx` (`local_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_progress`
--

DROP TABLE IF EXISTS `student_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_progress` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `local_user_id` bigint unsigned NOT NULL,
  `subtopic_node_id` bigint unsigned NOT NULL,
  `theory_completed` enum('pending','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `practice_completed` enum('pending','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `lab_completed` enum('pending','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `status` enum('not_started','in_progress','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_started',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `timeline_entries`
--

DROP TABLE IF EXISTS `timeline_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timeline_entries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('physicist','discovery') COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year_start` int NOT NULL,
  `year_end` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `portrait_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#01acff',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `timeline_type_idx` (`type`),
  KEY `timeline_year_idx` (`year_start`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `topic_nodes`
--

DROP TABLE IF EXISTS `topic_nodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topic_nodes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint unsigned DEFAULT NULL,
  `order` int NOT NULL DEFAULT '1',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jupyter_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lab_category_slug` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `icon_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `topic_nodes_slug_unique` (`slug`),
  KEY `topic_nodes_parent_id_topic_nodes_id_fk` (`parent_id`),
  CONSTRAINT `topic_nodes_parent_id_topic_nodes_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `topic_nodes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'labphschool'
--

--
-- Dumping routines for database 'labphschool'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-01 21:36:10
-- MySQL dump 10.13  Distrib 9.6.0, for macos26.4 (arm64)
--
-- Host: localhost    Database: labphschool
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','Administrator with full access','2026-06-21 15:54:14'),(2,'student','Student user','2026-06-21 15:54:14'),(3,'teacher','Teacher user','2026-06-21 15:54:14');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (1,'admin','$2b$12$ZfOlxYP.8ieHO1rrBAIrI.SPcoXr28V.mI1Ck2.QbJ4LvORd98qxO','Administrator','admin','active',NULL,'2026-06-30 16:30:33','2026-06-30 19:09:43','2026-06-30 19:09:43');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `topic_nodes`
--

LOCK TABLES `topic_nodes` WRITE;
/*!40000 ALTER TABLE `topic_nodes` DISABLE KEYS */;
INSERT INTO `topic_nodes` VALUES (1,NULL,1,'Кинематика','kinematics','Раздел механики, изучающий движение тел без рассмотрения причин, вызывающих это движение.','#2eff8c',NULL,'mechanics','2026-06-21 15:54:15','2026-06-28 00:50:35','mechanics'),(2,NULL,2,'Динамика','dynamics','Раздел механики, изучающий причины движения тел.','#ffcb3d',NULL,'mechanics','2026-06-21 15:54:15','2026-06-28 00:49:48','mechanics'),(3,NULL,2,'Законы сохранения','conservation','Фундаментальные законы: сохранение импульса, энергии, момента импульса.','#01acff',NULL,'mechanics','2026-06-21 15:54:15','2026-06-28 00:50:35','mechanics'),(4,NULL,3,'Статика и гидростатика','statics','Условия равновесия, давление, закон Архимеда.','#ff6b6b',NULL,'mechanics','2026-06-21 15:54:15','2026-06-28 00:50:35','fluid-mechanics'),(5,NULL,4,'Молекулярная физика','molecular','Основы МКТ, идеальный газ, термодинамические процессы.','#ff8c42',NULL,'molecular-thermodynamics','2026-06-21 15:54:15','2026-06-28 00:50:35','molecular-thermodynamics'),(6,NULL,5,'Электростатика','electrostatics','Закон Кулона, электрическое поле, потенциал, ёмкость.','#a78bfa',NULL,'electrodynamics','2026-06-21 15:54:15','2026-06-28 00:50:35','electrodynamics'),(7,NULL,6,'Постоянный ток','dc-circuits','Законы Ома, соединения проводников, работа и мощность тока.','#2eff8c',NULL,'electrodynamics','2026-06-21 15:54:15','2026-06-28 00:50:35','circuit'),(8,NULL,7,'Магнетизм','magnetism','Магнитное поле, сила Ампера, сила Лоренца, электромагнитная индукция.','#ffcb3d',NULL,'electrodynamics','2026-06-21 15:54:15','2026-06-28 00:50:35','magnetism'),(9,NULL,8,'Колебания и волны','oscillations','Механические и электромагнитные колебания, гармонические колебания, волны.','#01acff',NULL,NULL,'2026-06-21 15:54:15','2026-06-28 00:50:35','waves'),(10,NULL,9,'Оптика','optics','Закон преломления, линзы, оптические приборы, природа света.','#ff6b6b',NULL,'optics','2026-06-21 15:54:15','2026-06-28 00:50:35','optics'),(11,NULL,10,'Атомная физика','atomic','Модели атома, спектры, постулаты Бора, радиоактивность.','#ff8c42',NULL,'nuclear-physics','2026-06-21 15:54:15','2026-06-28 00:50:35','atomic'),(12,NULL,12,'Квантовая физика','quantum','Де Бройля, принцип неопределённости, элементы СТО.','#a78bfa',NULL,'nuclear-physics','2026-06-21 15:54:15','2026-06-28 00:50:35','nuclear-physics'),(18,2,1,'Законы Ньютона','dynamics-sub-1','Все законы Ньютона выполняются только в инерциальных системах отсчета.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(19,2,2,'Гравитационные силы. Сила тяжести и Вес','dynamics-sub-2','Закон всемирного тяготения. Сила тяжести и вес.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(20,2,3,'Электромагнитные силы. Силы упругости и трения','dynamics-sub-3','Сила упругости, закон Гука, силы трения.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(21,2,4,'Криволинейное движение. Центростремительная сила','dynamics-sub-4','Движение по окружности. Центростремительная сила.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(22,2,5,'Олимпиадные методы анализа','dynamics-sub-5','',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(23,3,1,'Импульс тела','conservation-sub-1','Импульс тела — векторная физическая величина.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(24,3,2,'Закон сохранения импульса','conservation-sub-2','Замкнутая система. Закон сохранения импульса.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(25,3,3,'Механическая работа и мощность','conservation-sub-3','Работа силы. Мощность. КПД.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(26,3,4,'Кинетическая и потенциальная энергия','conservation-sub-4','Кинетическая и потенциальная энергия.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(27,3,5,'Закон сохранения энергии','conservation-sub-5','Закон сохранения механической энергии.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(28,4,1,'Условия равновесия твёрдого тела','statics-sub-1','Условия равновесия твёрдого тела.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(29,4,2,'Момент силы','statics-sub-2','Плечо силы. Момент силы.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(30,4,3,'Давление в жидкостях и газах','statics-sub-3','Закон Паскаля. Гидростатическое давление.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(31,4,4,'Сила Архимеда','statics-sub-4','Сила Архимеда. Условия плавания тел.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(32,5,1,'Основы МКТ','molecular-sub-1','Базовые понятия молекулярно-кинетической теории.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(33,5,2,'Уравнение состояния идеального газа','molecular-sub-2','pV = νRT.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(34,5,3,'Изопроцессы','molecular-sub-3','Изотермический, изобарный, изохорный процессы.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(35,5,4,'Первое начало термодинамики','molecular-sub-4','ΔU = Q - A.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(36,6,1,'Закон Кулона','electrostatics-sub-1','F = k|q₁q₂|/r².',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(37,6,2,'Напряжённость электрического поля','electrostatics-sub-2','E = F/q = k|q|/r².',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(38,6,3,'Потенциал и работа поля','electrostatics-sub-3','Потенциал и работа электрического поля.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(39,6,4,'Конденсаторы и ёмкость','electrostatics-sub-4','Ёмкость конденсатора.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(40,7,1,'Закон Ома для участка цепи','dc-circuits-sub-1','I = U/R.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(41,7,2,'Последовательное и параллельное соединение','dc-circuits-sub-2','Соединение проводников.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(42,7,3,'Работа и мощность тока','dc-circuits-sub-3','Q = I²Rt. Мощность тока.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(43,7,4,'ЭДС и закон Ома для полной цепи','dc-circuits-sub-4','I = ε/(R+r).',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(44,8,1,'Магнитное поле','magnetism-sub-1','Магнитное поле. Магнитные линии.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(45,8,2,'Сила Ампера и Лоренца','magnetism-sub-2','Сила Ампера и сила Лоренца.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(46,8,3,'Закон электромагнитной индукции','magnetism-sub-3','εᵢ = -ΔΦ/Δt.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(47,8,4,'Самоиндукция','magnetism-sub-4','εₛ = -LΔI/Δt.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(48,9,1,'Гармонические колебания','oscillations-sub-1','Уравнение гармонических колебаний.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(49,9,2,'Электромагнитные колебания','oscillations-sub-2','T = 2π√(LC).',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(50,9,3,'Механические волны','oscillations-sub-3','v = λν.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(51,9,4,'Интерференция и дифракция','oscillations-sub-4','Условие максимума: Δd = mλ.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(52,10,1,'Отражение и преломление света','optics-sub-1','Законы отражения и преломления.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(53,10,2,'Линзы и изображения','optics-sub-2','Формула тонкой линзы.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(54,10,3,'Волновая природа света','optics-sub-3','Интерференция, дифракция, поляризация.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(55,10,4,'Квантовая природа света','optics-sub-4','Энергия фотона. Уравнение Эйнштейна для фотоэффекта.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(56,11,1,'Модели атома','atomic-sub-1','Томсон, Резерфорд, Бор.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(57,11,2,'Постулаты Бора','atomic-sub-2','Стационарные состояния. Излучение фотона.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(58,11,3,'Радиоактивность','atomic-sub-3','α, β, γ излучение.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(59,11,4,'Ядерные реакции','atomic-sub-4','Деление и синтез ядер.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(60,12,1,'Гипотеза де Бройля','quantum-sub-1','λ = h/p.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(61,12,2,'Принцип неопределённости','quantum-sub-2','Δx·Δp ≥ ℏ/2.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(62,12,3,'Основы СТО','quantum-sub-3','E = mc².',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(63,12,4,'Фундаментальные взаимодействия','quantum-sub-4','Гравитационное, электромагнитное, сильное, слабое.',NULL,NULL,NULL,'2026-06-21 15:54:15','2026-06-21 15:54:15',NULL),(71,1,1,'Равномерное прямолинейное движение','kinematics-sub-1','Равномерное прямолинейное движение — это движение по прямой линии, при котором тело за любые равные промежутки времени совершает одинаковые перемещения. \n\nГлавная фишка: \nскорость постоянна ($v = \\text{const}$)\n\nОсновное уравнение движения (зависимость координаты от времени):\n\n$$x(t) = x_0 + v_x t$$\n\nГде: $x$ — конечная координата $[м]$,\n$x_0$ — начальная координата $[м]$,\n$v_x$ — проекция скорости на ось $X$ $[м/с]$,\n$t$ — время $[с]$\n\nНе путай путь ($s$) и перемещение ($\\Delta x$). \nПри движении в одну сторону по прямой они равны, но если тело развернулось, то путь растет, а перемещение может уменьшаться. \n\nДля РПД без разворотов: $s = v \\cdot t$.\n\n### **График скорости $v(t)$**\n\nЭто всегда горизонтальная прямая. \n\nЛайфхак «Площадь»: Площадь фигуры под графиком скорости $v(t)$ численно равна пройденному пути $s$. \n\nДля РПД это просто прямоугольник: $S = v \\cdot t$. \n\n\n\n\n### **График координаты $x(t)$**\n\nЭто всегда прямая линия (наклонная).\n\nЛайфхак «Тангенс»: Чем круче график идет вверх, тем больше скорость. \n\nСкорость — это тангенс угла наклона графика к оси времени: $v = \\tan(\\alpha)$.\n> Если график идет вверх ($\\alpha < 90^\\circ$) $\\rightarrow v > 0$ (тело движется по оси $X$).\n\n> Если график идет вниз ($\\alpha > 90^\\circ$) $\\rightarrow v < 0$ (тело движется против оси $X$).\n\n> Если график параллелен оси времени $\\rightarrow v = 0$ (тело стоит на месте).','#2eff8c',NULL,NULL,'2026-06-28 07:54:50','2026-06-28 01:01:27','mechanics'),(72,1,2,'Равноускоренное движение','kinematics-sub-2','При равноускоренном движении ускорение постоянно: $a = \\text{const}$.\n\nОсновные формулы:\n- $v = v_0 + at$\n- $s = v_0t + \\frac{at^2}{2}$\n- $v^2 - v_0^2 = 2as$\n\nГрафик скорости от времени — наклонная прямая.',NULL,NULL,NULL,'2026-06-28 07:57:01','2026-06-28 01:01:27',NULL),(75,1,3,'Движение по окружности','kinematics-sub-3','Особенности движения по окружности с\nпостоянной по модулю скоростью:\n\n> Траектория движения тела есть окружность.\n\n\n> Вектор скорости всегда направлен по касательной к окружности.\n\n> Направление скорости постоянно меняется под действием центростремительного ускорения.\n\n> Центростремительное ускорение направлено к центру окружности и не вызывает изменения модуля скорости.\n\n\n\nЦентростремительное ускорение:\n$$a = \\frac{v^2}{R} = \\omega^2 R$$\n\nПериод: $T = \\frac{2\\pi R}{v}$\n\nЧастота: $\\nu = \\frac{1}{T}$\n\nУгловая скорость: $\\omega = \\frac{2\\pi}{T}$','#2eff8c',NULL,NULL,'2026-06-28 08:03:46','2026-06-28 01:01:27',NULL),(76,1,4,'Относительность движения','kinematics-sub-4','Скорость тела относительно **неподвижной** системы отсчёта равна векторной сумме скорости тела относительно **подвижной** системы и скорости **подвижной** системы относительно **неподвижной**:\n\n$$\\vec{v} = \\vec{v}\\ + \\vec{v}_0$$\n\n![kinematics-sub-4_p1.png](/uploads/1/1781892532019-VKatTjzANKC1.png)\n','#2eff8c',NULL,NULL,'2026-06-28 08:06:32','2026-06-28 01:01:27',NULL),(77,1,5,'Движение под углом к горизонту','kinematics-sub-5','Это движение в плоскости, поэтому для описания движения необходимо 2 координаты.\n\nСчитаем, что движение происходит вблизи поверхности Земли, поэтому ускорение тела – ускорение свободного падения (a = g).\n','#2eff8c',NULL,NULL,'2026-06-28 08:06:45','2026-06-28 01:01:27',NULL);
/*!40000 ALTER TABLE `topic_nodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
INSERT INTO `resources` VALUES (1,'Механическое движение','Плейлист с теорией и разбором задач на механическое движение','video','https://www.youtube.com/playlist?list=PL1Us50cZo25k0P5jsqx5FYgVMCkxNxMKC','Видео,Механическое движение,Кинематика,Механика','2026-06-21 15:54:15'),(2,'Электромагнитные волны','Плейлист с теорией и разбором задач на электромагнитные волны','video','https://youtube.com/playlist?list=PL1Us50cZo25meF0AqFID_fR0qwgYUkXY6&si=zXXmFvacNUJpXBPX','Видео,Электромагнитные волны,Оптика,Электричество','2026-06-21 15:54:15'),(3,'Давление твёрдых тел, жидкостей и газов','Плейлист с теорией и разбором задач на давление в твёрдых телах, жидкостях и газах','video','https://youtube.com/playlist?list=PL1Us50cZo25m3ozxGRcOFqsGM30UK4NQ5&si=vKRZJPoiqVBia2aF','Видео,Давление,Гидростатика,Механика','2026-06-21 15:54:15'),(4,'Электрические дуги в замедленной съёмке','Сверхзамедленная съёмка высоковольтных электрических разрядов','video','https://www.youtube.com/watch?v=HDzVD-cqiWM','Видео,Электричество,Разряды,Замедленная съёмка','2026-06-21 15:54:15'),(5,'Измерения. Теория погрешностей','Плейлист с теорией измерений и обработки погрешностей в школьной физике','video','https://youtube.com/playlist?list=PL1Us50cZo25n0s1gsVxipdJkc6EQoptM5&si=FGMT6P_c2y_65lhB','Видео,Измерения,Погрешности,Теория','2026-06-21 15:54:15'),(6,'Удивительная физика капель воды','Захватывающее видео о физике капель воды в замедленной съёмке','video','https://youtu.be/yFvEl3TTD38?si=1pRtjunepib92Qan','Видео,Молекулярная физика,Поверхностное натяжение','2026-06-21 15:54:15'),(7,'Справочник формул по физике','200+ формул по всем темам школьного курса с пояснениями','reference','#','Справочник,Формулы,Все темы','2026-06-21 15:54:15'),(8,'1001 задача по физике с решениями','Сборник задач по физике с подробными решениями. Авторы: И.М. Гельфгат, Л.Э. Генденштейн, Л.А. Кирик','workbook','https://lib.brsu.by/sites/default/files/books/%D0%93%D0%B5%D0%BB%D1%8C%D1%84%D0%B3%D0%B0%D1%82%20%D0%98.%D0%9C.%2C%20%D0%9B.%D0%AD.%D0%93%D0%B5%D0%BD%D0%B4%D0%B5%D0%BD%D1%88%D1%82%D0%B5%D0%B9%D0%BD%2C%20%D0%9B.%D0%90.%D0%9A%D0%B8%D1%80%D0%B8%D0%BA%20-%201001%20%D0%B7%D0%B0%D0%B4%D0%B0%D1%87%D0%B0%20%D0%BF%D0%BE%20%D1%84%D0%B8%D0%B7%D0%B8%D0%BA%D0%B5%20%D1%81%20%D1%80%D0%B5%D1%88%D0%B5%D0%BD%D0%B8%D1%8F%D0%BC%D0%B8_.pdf','Задачник,1001 задача,PDF,Решения','2026-06-21 15:54:15'),(9,'Решу ЕГЭ по физике','Банк заданий ЕГЭ по физике с разбором решений и тренировочными вариантами','workbook','https://phys-ege.sdamgia.ru/','ЕГЭ,Задачник,Экзамен,Тренировка','2026-06-21 15:54:15'),(10,'Тренажёр по решению задач (7–9 класс)','Интерактивный тренажёр по решению физических задач для учащихся 7–9 классов','workbook','https://physics-engineers.ru/page/tasks','Задачник,Задачи,7–9 класс,Тренажёр','2026-06-21 15:54:15'),(11,'Интерактивная модель: Солнечная система','3D-модель планет с реальными орбитами и масштабами','model','https://eyes.nasa.gov/apps/solar-system/#/home','Астрофизика,Модель,3D','2026-06-21 15:54:15'),(12,'Справочник: Квантовая физика','Основные понятия и формулы квантовой механики','reference','#','Кванты,Атом,Фотоэффект','2026-06-21 15:54:15'),(13,'Интерактивная модель: Маятник','Симуляция математического и пружинного маятника','model','https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_ru.html','Колебания,Маятник,Механика','2026-06-21 15:54:15'),(14,'Тренажёр: сложение векторов','Интерактивная симуляция для изучения сложения и вычитания векторов','model','https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition_all.html','Механика,Векторы,Модель','2026-06-21 15:54:15'),(15,'Океаны и волны (живой 3D-глобус)','Интерактивная визуализация глобальных погодных условий, океанских течений и волн в реальном времени','model','https://earth.nullschool.net/','Гидростатика,Астрофизика,Модель,3D','2026-06-21 15:54:15'),(16,'Интерактивная карта потребления и генерации электроэнергии','Изучите в реальном времени, как различные страны производят и потребляют электроэнергию','model','https://app.electricitymaps.com/map/live/fifteen_minutes','Электричество,Энергетика,Модель','2026-06-21 15:54:15'),(17,'Виртуальное исследование планет (NASA Trek)','Интерактивный портал NASA для исследования поверхностей планет и спутников Солнечной системы','model','https://trek.nasa.gov/#','Астрофизика,Модель,3D,NASA','2026-06-21 15:54:15');
/*!40000 ALTER TABLE `resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lab_categories`
--

LOCK TABLES `lab_categories` WRITE;
/*!40000 ALTER TABLE `lab_categories` DISABLE KEYS */;
INSERT INTO `lab_categories` VALUES (1,1,'Механика','mechanics','7–9 класс','Основы классической механики: кинематика, динамика, статика, законы сохранения.','Кинематика, динамика, статика','#2eff8c','mechanics','2026-06-01 11:52:50'),(7,7,'Оптика','optics','8–11 класс','Отражение и преломление света, линзы, интерференция, дифракция, дисперсия.','Свет, линзы, волны','#66bb6a','optics','2026-06-01 11:52:50'),(9,2,'Молекулярная физика и термодинамика','molecular-thermodynamics','8–10 класс','Молекулярно-кинетическая теория, идеальный газ, теплопередача, первое и второе начала термодинамики, тепловые машины.','МКТ, газ, термодинамика','#ff7043','thermal','2026-06-01 12:57:33'),(10,3,'Электродинамика','electrodynamics','8–11 класс','Электростатика, постоянный ток, магнитное поле, электромагнитная индукция, колебательный контур, электромагнитные волны.','Электричество и магнетизм','#ffd600','circuit','2026-06-01 12:57:33');
/*!40000 ALTER TABLE `lab_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lab_subcategories`
--

LOCK TABLES `lab_subcategories` WRITE;
/*!40000 ALTER TABLE `lab_subcategories` DISABLE KEYS */;
INSERT INTO `lab_subcategories` VALUES (1,1,1,'Кинематика','kinematics','Равномерное и равноускоренное движение, движение по окружности, относительность движения.','2026-06-01 12:57:33'),(2,1,2,'Динамика','dynamics','Законы Ньютона, силы в природе, сила тяжести, сила упругости, сила трения.','2026-06-01 12:57:33'),(3,1,3,'Статика','statics','Условия равновесия тел, момент силы, центр тяжести, простые механизмы.','2026-06-01 12:57:33'),(5,9,1,'Молекулярная физика','molecular-physics','Основы МКТ, идеальный газ, уравнение состояния, изопроцессы.','2026-06-01 12:57:33'),(6,9,2,'Термодинамика','thermodynamics','Первое и второе начала термодинамики, тепловые машины, КПД, энтропия.','2026-06-01 12:57:33'),(8,10,2,'Постоянный ток','dc-circuits','Закон Ома, соединение проводников, работа и мощность тока.','2026-06-01 12:57:33'),(10,7,1,'Геометрическая оптика','geometric-optics','Отражение, преломление, линзы, зеркала, оптические приборы.','2026-06-01 12:57:33'),(15,7,2,'Волновая и квантовая оптика','wave-quantum-optics','Интерференция, дифракция, спектры, волновая и квантовая природа света.','2026-06-12 14:21:04');
/*!40000 ALTER TABLE `lab_subcategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lab_works`
--

LOCK TABLES `lab_works` WRITE;
/*!40000 ALTER TABLE `lab_works` DISABLE KEYS */;
INSERT INTO `lab_works` VALUES (1,9,1,'Измерение средней плотности вещества','density-measurement','Определить плотность различных твёрдых и жидких веществ экспериментальным путём и сравнить с табличными значениями.','**Плотность** — физическая величина, характеризующая вещество и численно равная отношению массы тела к его объёму.\n\n$$\\rho = \\frac{m}{V}$$\n\ngде:\n- $\\rho$ — плотность вещества (кг/м³)\n- $m$ — масса тела (кг)\n- $V$ — объём тела (м³)\n\n**Единицы измерения:**\n- Основная единица: кг/м³\n- Практическая единица: г/см³\n\n**Методы измерения объёма:**\n1. Для правильных тел — по геометрическим формулам\n2. Для неровных тел — метод вытеснения жидкости (мензурка)\n\n**Оборудование:**\n- Весы\n- Мензурка\n- Исследуемые тела\n- Вода','[\"Весы\",\"Мензурка\",\"Исследуемые тела\",\"Вода\"]','1. Измерьте массу тела на весах.\n2. Налейте в мензурку воду и запишите начальный объём V₁.\n3. Опустите тело в воду и запишите новый объём V₂.\n4. Вычислите объём тела: V = V₂ − V₁.\n5. Рассчитайте плотность: ρ = m/V.\n6. Повторите измерения 3–5 раз для разных тел.\n7. Сравните полученные значения с табличными.','В ходе работы была определена плотность веществ. Среднее значение плотности составило {{avgDensity}} {{unit}}. Отклонение от табличного значения {{theoreticalDensity}} составило {{errorPercent}}%. Вывод: экспериментальным путём можно определить плотность вещества с погрешностью около {{errorPercent}}%.','draft','2026-06-01 11:52:50','2026-06-28 09:46:27',5,27,NULL,'own'),(2,1,2,'Измерение архимедовой силы','archimedes-force','Экспериментально исследовать зависимость архимедовой силы от объёма погружённой части тела и от плотности жидкости.','**Архимедова сила** — сила, действующая на тело, погружённое в жидкость или газ, и направленная вверх. Численно равна весу вытесненной жидкости.\n\n$$F_А = \\rho_{ж} \\cdot g \\cdot V_{погр}$$\n\ngде:\n- $F_А$ — архимедова сила (Н)\n- $\\rho_{ж}$ — плотность жидкости (кг/м³)\n- $g ≈ 9,8$ Н/кг — ускорение свободного падения\n- $V_{погр}$ — объём погружённой части тела (м³)\n\n**Закон Архимеда:** на тело, погружённое в жидкость, действует выталкивающая сила, равная весу жидкости в объёме тела.\n\n**Формула через разность весов:**\n$$F_А = P_{воздухе} − P_{жидкости}$$','[\"Динамометр\",\"Мензурка\",\"Цилиндр металлический\",\"Вода\",\"Раствор соли\"]','**Часть А. Зависимость Fₐ от объёма погружения**\n1. Измерьте вес тела в воздухе P₀.\n2. Погрузите тело на 1/3, измерьте вес P₁.\n3. Погрузите на 2/3, измерьте вес P₂.\n4. Полностью погрузите, измерьте вес P₃.\n5. Рассчитайте Fₐ = P₀ − P для каждого случая.\n\n**Часть Б. Зависимость Fₐ от плотности жидкости**\n1. Повторите опыт в воде.\n2. Повторите опыт в растворе соли (более плотная жидкость).\n3. Сравните величины Fₐ.','Архимедова сила прямо пропорциональна объёму погружённой части тела и плотности жидкости. В воде средняя Fₐ = {{avgFaWater}} Н, в соляном растворе Fₐ = {{avgFaSalt}} Н. Разница объясняется различной плотностью жидкостей.','draft','2026-06-01 11:52:50','2026-06-28 09:46:45',2,27,NULL,'own'),(3,1,3,'Независимость выталкивающей силы от массы тела','buoyancy-independence','Экспериментально доказать, что выталкивающая сила не зависит от массы тела при постоянном объёме.','Если два тела имеют одинаковый объём, но разную массу (например, алюминиевый и свинцовый цилиндры одинакового размера), то выталкивающая сила, действующая на них в одной и той же жидкости, будет одинаковой.\n\n$$F_{А1} = F_{А2} = \\rho_{ж} \\cdot g \\cdot V$$\n\nРазличие проявляется в том, что более тяжёлое тело может тонуть, а лёгкое — всплывать, но сама сила Архимеда определяется только объёмом и плотностью жидкости.','[\"Динамометр\",\"Цилиндры одинакового объёма (разные материалы)\",\"Стакан с водой\"]','1. Возьмите два цилиндра одинакового объёма, но из разных материалов.\n2. Измерьте вес каждого в воздухе.\n3. Поочерёдно полностью погрузите каждый цилиндр в воду.\n4. Измерьте вес каждого в воде.\n5. Рассчитайте Fₐ для каждого.\n6. Сравните результаты.','Выталкивающая сила для тел одинакового объёма {{volume}} м³, но разной массы ({{mass1}} г и {{mass2}} г) оказалась примерно одинаковой: Fₐ₁ = {{fa1}} Н, Fₐ₂ = {{fa2}} Н. Это подтверждает, что Fₐ не зависит от массы тела.','draft','2026-06-01 11:52:50','2026-06-28 09:46:42',2,27,NULL,'own'),(4,10,1,'Измерение работы электрического тока','electric-work-measurement','Экспериментально определить работу и мощность электрического тока в цепи с резистором.','**Работа электрического тока** — энергия, которую получает участок цепи от протекающего тока.\n\n$$A = U \\cdot I \\cdot t$$\n\ngде:\n- $A$ — работа тока (Дж)\n- $U$ — напряжение (В)\n- $I$ — сила тока (А)\n- $t$ — время (с)\n\n**Мощность тока:**\n$$P = \\frac{A}{t} = U \\cdot I$$\n\n**Закон Джоуля–Ленца:**\n$$Q = I^2 \\cdot R \\cdot t$$\n\nПри постоянном сопротивлении работа тока идёт на нагрев проводника.','[\"Источник питания\",\"Амперметр\",\"Вольтметр\",\"Резистор\",\"Ключ\",\"Соединительные провода\",\"Секундомер\"]','1. Соберите электрическую цепь: источник питания → ключ → амперметр → резистор (последовательно). Вольтметр подключите параллельно резистору.\n2. Замкните цепь. Запишите показания амперметра (I) и вольтметра (U).\n3. Включите секундомер. Через t = 60 с разомкните цепь.\n4. Рассчитайте работу тока: A = U·I·t.\n5. Рассчитайте мощность: P = U·I.\n6. Повторите опыт при другом напряжении (измените источник питания).','При напряжении U = {{voltage}} В и силе тока I = {{current}} А за время t = {{time}} с работа тока составила A = {{work}} Дж, мощность P = {{power}} Вт. Увеличение напряжения приводит к росту работы и мощности тока.','draft','2026-06-01 11:52:51','2026-06-30 19:11:04',8,38,'faradays-electromagnetic-lab','external'),(5,1,1,'Изучение прямолинейного равномерного движения','uniform-linear-motion','Экспериментально определить скорость тела при равномерном прямолинейном движении и построить график зависимости координаты от времени.','При **равномерном прямолинейном движении** тело за равные промежутки времени совершает равные перемещения. Скорость остается постоянной.\n\n**Основные формулы:**\n$$s = v \\cdot t$$\n$$x = x_0 + v \\cdot t$$\n\nгде\n- $s$ — путь (м)\n- $v$ — скорость (м/с)\n- $t$ — время (с)\n- $x$ — координата тела (м)\n- $x_0$ — начальная координата (м)\n\n**График $x(t)$** при равномерном движении — прямая линия, угловой коэффициент которой равен скорости $v$.\n\n**График $s(t)$** — прямая линия, проходящая через начало координат.','[\"Секундомер\",\"Измерительная лента\",\"Движущееся тело (тележка)\",\"Линейка\",\"Метки\"]','1. Установите начальное положение тела на измерительной ленте. Запишите x0.\n2. Задайте скорость движения тела.\n3. Запустите движение и одновременно включите секундомер.\n4. Через равные промежутки времени (например, каждые 2 с) фиксируйте координату тела.\n5. Занесите результаты в таблицу.\n6. Постройте график зависимости x(t).\n7. По угловому коэффициенту графика определите скорость движения.','В ходе работы было исследовано равномерное прямолинейное движение. Установлено, что координата тела линейно зависит от времени. Экспериментально определенная скорость составила v = {{avgSpeed}} м/с, что соответствует заданному значению с погрешностью {{errorPercent}}%.','published','2026-06-02 06:49:22','2026-06-30 18:58:48',1,13,'uniform-linear-motion','own'),(6,1,2,'Изучение прямолинейного равноускоренного движения','uniformly-accelerated-motion','Экспериментально измерить путь и скорость тела, движущегося с постоянным ускорением, и определить величину ускорения.','При **равноускоренном прямолинейном движении** ускорение остается постоянным.\n\n**Основные формулы:**\n$$v = v_0 + a \\cdot t$$\n$$s = v_0 \\cdot t + \\frac{a \\cdot t^2}{2}$$\n$$v^2 - v_0^2 = 2 \\cdot a \\cdot s$$\n\ngde:\n- $v_0$ — начальная скорость (м/с)\n- $a$ — ускорение (м/с²)\n- $t$ — время (с)\n- $s$ — путь (м)\n\n**График $v(t)$** при равноускоренном движении — наклонная прямая. Угловой коэффициент равен ускорению $a$.\n\nЭксперимент часто выполняется на **наклонном желобе** или с помощью **машины Атвуда**.','[\"Наклонный желоб\",\"Шарик (или тележка)\",\"Секундомер\",\"Линейка\",\"Угломер\",\"Опоры\"]','1. Установите наклонный желоб под углом 10–15° к горизонту.\n2. Отпустите шарик из начальной точки (v0 = 0).\n3. Измерьте время движения до нескольких контрольных точек.\n4. Для каждой точки рассчитайте пройденный путь s и мгновенную скорость v.\n5. Повторите опыт при другом угле наклона (другом ускорении).\n6. Постройте графики s(t) и v(t).\n7. По графику v(t) определите ускорение.','При равноускоренном движении с начальной скоростью v0 = {{v0}} м/с и ускорением a = {{avgAccel}} м/с² путь пропорционален квадрату времени, а скорость линейно зависит от времени. Экспериментально полученное значение ускорения подтверждает теоретический расчет: a = g·sin(α) ≈ {{theoreticalAccel}} м/с².','published','2026-06-02 06:49:22','2026-06-28 02:33:41',1,14,'uniformly-accelerated-motion','own'),(7,1,3,'Определение ускорения свободного падения','free-fall-g','Экспериментально определить ускорение свободного падения g двумя способами: с помощью математического маятника и по времени свободного падения тела.','**Способ 1: Математический маятник**\n\nМатематический маятник — материальная точка, подвешенная на невесомой нерастяжимой нити.\n\nПериод его колебаний:\n$$T = 2\\pi \\sqrt{\\frac{l}{g}}$$\n\nОтсюда:\n$$g = \\frac{4\\pi^2 l}{T^2}$$\n\nДля повышения точности измеряют время $t$ большого числа колебаний $n$:\n$$T = \\frac{t}{n}$$\n\nПри малых амплитудах (α < 5°) период не зависит от массы груза.\n\n> 🔗 **Внешний ресурс**: изучи поведение маятника в интерактивной симуляции [PhET — Лаборатория маятника](https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_ru.html)\n\n**Способ 2: Свободное падение**\n\nПри свободном падении тела с начальной скоростью $v_0 = 0$:\n$$h = \\frac{g t^2}{2}$$\n\nОтсюда:\n$$g = \\frac{2h}{t^2}$$\n\nгде:\n- $h$ — высота падения (м)\n- $t$ — время падения (с)\n- $g$ — ускорение свободного падения (м/с²)\n\nДля повышения точности опыт повторяют несколько раз и используют среднее время падения.','[\"Штатив с кольцом\",\"Нить с грузом (шарик)\",\"Секундомер\",\"Линейка\",\"Транспортир\"]','**Способ 1: Математический маятник**\n1. Подвесьте груз на нити длиной l = 50 см.\n2. Отведите маятник на малый угол (2–3°) и отпустите.\n3. Измерьте время t = 20 полных колебаний.\n4. Вычислите период: T = t/20.\n5. Рассчитайте g по формуле g = 4π²l/T².\n6. Повторите опыт для нитей длиной 75 см, 100 см, 125 см, 150 см.\n7. Постройте график T²(l) и определите g по угловому коэффициенту.\n\n**Способ 2: Свободное падение**\n1. Определите высоту h (в метрах), с которой будет падать тело.\n2. Отпустите предмет и с помощью секундомера замерьте точное время падения t.\n3. Рассчитайте g по формуле g = 2h/t².\n4. Повторите опыт 3–5 раз и используйте среднее время падения.\n5. Сравните полученное значение g с табличным значением 9,8 м/с².','В ходе работы было определено ускорение свободного падения с помощью математического маятника. Среднее значение g = {{avgG}} м/с². Погрешность измерения составила {{errorPercent}}% по сравнению с табличным значением 9,8 м/с². Установлено, что T² пропорционально длине нити l.','published','2026-06-02 06:49:22','2026-06-28 09:53:02',1,44,'free-fall','own'),(10,7,1,'Исследование закона отражения света','light-reflection','Экспериментально проверить закон отражения света: угол падения равен углу отражения.','**Закон отражения света** состоит из двух частей:\n\n1. Падающий луч, отражённый луч и нормаль к поверхности зеркала в точке падения лежат в одной плоскости.\n2. Угол отражения β равен углу падения α:\n\n$$\\alpha = \\beta$$\n\nгде:\n- $\\alpha$ — угол между падающим лучом и нормалью\n- $\\beta$ — угол между отражённым лучом и нормалью\n\nУгол падения изменяется от 0° (луч падает перпендикулярно) до 90° (луч скользит по поверхности).','[\"Плоское зеркало\",\"Лазерный указатель или источник света с щелью\",\"Транспортир\",\"Лист бумаги\",\"Карандаш\"]','1. Поставьте плоское зеркало вертикально на лист бумаги.\n2. Нарисуйте линию, обозначающую поверхность зеркала.\n3. Восстановите нормаль к поверхности зеркала в точке падения.\n4. Направьте луч света на зеркало под углом α к нормали.\n5. Отметьте направление отражённого луча.\n6. Измерьте угол отражения β.\n7. Повторите опыт для углов падения 20°, 30°, 45°, 60°.\n8. Запишите результаты в таблицу и сравните α и β.','В ходе работы был проверен закон отражения света. Установлено, что угол падения α = {{alpha}}° равен углу отражения β = {{beta}}°. Закон отражения выполняется: α = β.','published','2026-06-12 13:50:00','2026-06-30 00:19:01',10,47,'geometric-optics','external'),(11,7,2,'Изучение преломления света','light-refraction','Наблюдать изменение направления светового луча при переходе из воздуха в прозрачную среду и проверить закон Снеллиуса.','**Закон преломления света (закон Снеллиуса):**\n\nПри переходе света из одной прозрачной среды в другую направление луча изменяется. Отношение синуса угла падения к синусу угла преломления постоянно для двух данных сред:\n\n$$n_1 \\sin\\alpha = n_2 \\sin\\beta$$\n\nгде:\n- $n_1$ — показатель преломления первой среды (для воздуха n₁ ≈ 1)\n- $n_2$ — показатель преломления второй среды\n- $\\alpha$ — угол падения\n- $\\beta$ — угол преломления\n\nЕсли свет переходит из оптически менее плотной среды в более плотную (например, воздух → стекло), то луч приближается к нормали (β < α).','[\"Плоскопараллельная стеклянная пластина или аквариум с водой\",\"Лазерный указатель\",\"Транспортир\",\"Лист бумаги\",\"Карандаш\"]','1. Поставьте плоскопараллельную пластину на лист бумаги.\n2. Нарисуйте границу раздела сред и восстановите нормаль.\n3. Направьте луч света из воздуха в пластину под углом α.\n4. Отметьте направление преломлённого луча внутри пластины.\n5. Измерьте угол преломления β.\n6. Повторите опыт для разных углов падения.\n7. Сравните отношение sinα/sinβ с показателем преломления среды.','При переходе света из воздуха в среду с показателем преломления n = {{n}} угол преломления β = {{beta}}° отличается от угла падения α = {{alpha}}°, что подтверждает закон Снеллиуса: sinα/sinβ = n.','draft','2026-06-12 13:50:00','2026-06-28 09:45:57',10,47,'light-refraction','own'),(12,7,3,'Измерение показателя преломления стекла','glass-refraction-index','Определить показатель преломления стекла с помощью плоскопараллельной пластины.','Показатель преломления среды показывает, во сколько раз скорость света в вакууме больше, чем в данной среде. Для стекла типичное значение n ≈ 1,5.\n\nПо закону преломления:\n\n$$n = \\frac{\\sin\\alpha}{\\sin\\beta}$$\n\nгде:\n- $\\alpha$ — угол падения в воздухе\n- $\\beta$ — угол преломления в стекле\n\nДля повышения точности опыт повторяют при нескольких углах падения и находят среднее значение n.','[\"Плоскопараллельная стеклянная пластина\",\"Лазерный указатель\",\"Транспортир\",\"Лист бумаги\",\"Карандаш\",\"Линейка\"]','1. Поставьте стеклянную пластину на лист бумаги и обведите её контур.\n2. Восстановите нормаль к границе раздела в точке падения.\n3. Направьте луч под углом α = 30° к нормали.\n4. Отметьте падающий и преломлённый лучи.\n5. Измерьте угол преломления β.\n6. Рассчитайте n = sinα/sinβ.\n7. Повторите опыт для углов 40°, 50°, 60°.\n8. Найдите среднее значение n.','Показатель преломления стекла, определённый экспериментально, составил n = {{nMeasured}}. Табличное значение для обычного стекла n ≈ {{nTabular}}. Погрешность измерения объясняется погрешностью измерения углов.','draft','2026-06-12 13:50:00','2026-06-28 09:45:54',10,47,NULL,'own'),(15,7,1,'Измерение длины световой волны','wavelength-measurement','Определить длину световой волны с помощью дифракционной решётки и измерительной линейки.','**Условие главных максимумов дифракционной решётки:**\n\n$$d \\cdot \\sin\\varphi = k \\cdot \\lambda$$\n\nгде:\n- $d$ — период (постоянная) решётки\n- $\\varphi$ — угол дифракции\n- $k$ — порядок спектра ($k = 0, \\pm1, \\pm2, \\ldots$)\n- $\\lambda$ — длина волны\n\nОтсюда:\n\n$$\\lambda = \\frac{d \\cdot \\sin\\varphi}{k}$$\n\nДля повышения точности измеряют углы нескольких порядков спектра и находят среднее значение $\\lambda$.','[\"Дифракционная решётка\",\"Лазер или спектральная лампа\",\"Штатив\",\"Измерительная линейка\",\"Экран\"]','1. Установите дифракционную решётку перед источником света.\n2. Расположите экран на расстоянии L от решётки.\n3. Измерьте расстояние x от центрального максимума до максимума порядка k.\n4. Рассчитайте угол дифракции: sinφ ≈ x/L (при малых углах) или φ = arctg(x/L).\n5. Рассчитайте длину волны: λ = d·sinφ/k.\n6. Повторите измерения для разных порядков k.\n7. Найдите среднее значение λ.','Длина световой волны, определённая по дифракционной решётке с постоянной d = {{d}} мкм, составила λ = {{lambda}} нм. Полученное значение соответствует видимому диапазону спектра.','draft','2026-06-12 14:21:04','2026-06-28 09:45:51',15,49,NULL,'own'),(16,7,2,'Наблюдение интерференции и дифракции света','interference-diffraction','Изучить явления интерференции и дифракции света и подтвердить их волновую природу.','**Интерференция света** — явление наложения световых волн, при котором в пространстве возникает устойчивая картина чередования максимумов и минимумов интенсивности.\n\nУсловие максимума при интерференции на двух щелях:\n\n$$\\Delta = d \\cdot \\frac{x}{L} = k\\lambda$$\n\nРасстояние между соседними интерференционными полосами:\n\n$$\\Delta x = \\frac{\\lambda L}{d}$$\n\nгде:\n- $d$ — расстояние между щелями\n- $L$ — расстояние от щелей до экрана\n- $\\lambda$ — длина волны\n\n**Дифракция** — огибание светом препятствий, также являющееся проявлением волновой природы света.','[\"Установка для наблюдения интерференции\",\"Лазер\",\"Две щели или дифракционная решётка\",\"Экран\",\"Линейка\"]','1. Направьте лазерный луч на две близко расположенные щели.\n2. Наблюдайте интерференционную картину на экране.\n3. Измерьте расстояние L от щелей до экрана.\n4. Измерьте расстояние Δx между соседними светлыми полосами.\n5. Рассчитайте длину волны: λ = Δx·d/L.\n6. Повторите опыт с другим расстоянием L или другими щелями.\n7. Сравните результаты с табличным значением λ для лазера.','Наблюдение интерференционной картины подтверждает волновую природу света. Расстояние между соседними полосами Δx = {{fringeSpacing}} мм, расчётная длина волны λ = {{lambda}} нм.','draft','2026-06-12 14:21:04','2026-06-28 09:45:47',15,49,NULL,'own'),(18,9,1,'Опытная проверка закона Бойля–Мариотта','boyle-mariotte','Экспериментально проверить, что при постоянной температуре произведение давления и объёма газа остаётся постоянным.','**Закон Бойля–Мариотта** утверждает, что при постоянной температуре и неизменной массе идеального газа произведение давления на объём постоянно:\n\n$$pV = \\text{const}$$\n\nили\n\n$$p_1 V_1 = p_2 V_2$$\n\nгде:\n- $p$ — давление газа (Па)\n- $V$ — объём газа (м³)\n\nПри изотермическом расширении газа давление уменьшается обратно пропорционально объёму. График зависимости $p(V)$ — гипербола, а в координатах $p$ от $1/V$ — прямая линия, проходящая через начало координат.','[\"Цилиндр с поршнем\",\"Манометр\",\"Термостат\",\"Газ\"]','1. Установите температуру газа (должна оставаться постоянной).\n2. Задайте начальный объём газа в цилиндре.\n3. Запишите показания манометра (давление p).\n4. Медленно изменяйте объём, перемещая поршень.\n5. Для каждого положения поршня записывайте объём V и давление p.\n6. Рассчитайте произведение p·V для каждого измерения.\n7. Постройте график p(V) и убедитесь, что он имеет вид гиперболы.','При температуре T = {{temperature}} К проверена изотерма идеального газа. Среднее произведение p·V составило {{avgPV}} Дж. Полученные данные подтверждают закон Бойля–Мариотта: при постоянной температуре pV = const.','draft','2026-06-13 03:11:48','2026-06-28 09:46:22',5,NULL,NULL,'own'),(19,9,2,'Изучение изобарного процесса','isobaric-process','Экспериментально установить зависимость объёма фиксированной массы газа от температуры при постоянном давлении.','**Изобарный процесс** — процесс, происходящий при постоянном давлении. Для идеального газа при $p = \\text{const}$:\n\n$$\\frac{V}{T} = \\text{const}$$\n\nили\n\n$$\\frac{V_1}{T_1} = rac{V_2}{T_2}$$\n\nгде:\n- $V$ — объём газа (м³)\n- $T$ — абсолютная температура (К)\n\nПри нагревании газа при постоянном давлении его объём увеличивается прямо пропорционально абсолютной температуре. График $V(T)$ — прямая линия, продолжение которой при $T = 0$ К проходит через начало координат.','[\"Цилиндр с подвижным поршнем\",\"Термометр\",\"Нагреватель\",\"Газ\"]','1. Установите постоянное давление на поршне (например, атмосферное).\n2. Задайте начальную температуру газа.\n3. Измерьте объём газа в цилиндре.\n4. Постепенно нагревайте газ, поддерживая давление постоянным.\n5. Для каждой температуры записывайте объём V.\n6. Рассчитайте отношение V/T.\n7. Постройте график V(T) и проверьте его линейность.','При постоянном давлении p = {{pressure}} кПа установлена прямая пропорциональность между объёмом и абсолютной температурой газа. Среднее отношение V/T составило {{avgVT}} м³/К, что подтверждает закон Гей-Люссака.','draft','2026-06-13 03:11:48','2026-06-28 09:46:19',5,NULL,NULL,'own'),(21,9,1,'Определение удельной теплоёмкости твёрдого тела','specific-heat-capacity','Определить удельную теплоёмкость металлического тела по результатам теплообмена с водой в калориметре.','**Количество теплоты**, необходимое для нагревания тела массой $m$ на $Delta T$ градусов:\n\n$$Q = c \\cdot m \\cdot \\Delta T$$\n\nгде $c$ — **удельная теплоёмкость** вещества (Дж/(кг·°C)).\n\nВ изолированной системе «горячее тело + холодная вода» количество теплоты, отданного телом, равно количеству теплоты, полученному водой:\n\n$$c_{т} m_{т} (T_{т} - T_{р}) = c_{в} m_{в} (T_{р} - T_{в})$$\n\nгде:\n- $T_{т}$ — начальная температура тела\n- $T_{в}$ — начальная температура воды\n- $T_{р}$ — температура в момент теплового равновесия\n- $c_{в} = 4200$ Дж/(кг·°C) — удельная теплоёмкость воды','[\"Калориметр\",\"Весы\",\"Термометр\",\"Нагретый металлический брусок\",\"Вода\"]','1. Измерьте массу металлического бруска m_т.\n2. Нагрейте брусок до температуры T_т.\n3. Налейте в калориметр холодную воду массой m_в и измерьте её температуру T_в.\n4. Опустите брусок в воду и замкните крышку калориметра.\n5. Дождитесь теплового равновесия и измерьте установившуюся температуру T_р.\n6. Рассчитайте удельную теплоёмкость тела по формуле теплового баланса.\n7. Сравните результат с табличным значением для данного металла.','В результате теплообмена в калориметре установлена температура равновесия T_р = {{equilibriumTemp}} °C. Рассчитанная удельная теплоёмкость металла c = {{specificHeat}} Дж/(кг·°C). Табличное значение для {{materialName}} c_табл = {{tabularHeat}} Дж/(кг·°C), погрешность составила {{errorPercent}}%.','draft','2026-06-13 03:11:48','2026-06-28 09:46:16',6,NULL,NULL,'own'),(22,9,2,'Измерение относительной влажности воздуха','relative-humidity','Определить относительную влажность воздуха по показаниям сухого и влажного термометров психрометра.','**Относительная влажность воздуха** — отношение давления водяного пара, содержащегося в воздухе, к давлению насыщенного пара при той же температуре:\n\n$$\\varphi = \\frac{p_{пар}}{p_{нас}} \\cdot 100\\%$$\n\n**Психрометрический метод:** по разности показаний сухого ($T_{с}$) и влажного ($T_{в}$) термометров определяют влажность с помощью психрометрической таблицы.\n\nЧем суше воздух, тем интенсивнее испарение с влажного термометра, тем больше его охлаждение и тем больше разность $\\Delta T = T_{с} - T_{в}$.','[\"Психрометр\",\"Сухой термометр\",\"Влажный термометр\",\"Психрометрическая таблица\"]','1. Запишите показания сухого термометра T_с.\n2. Запишите показания влажного термометра T_в.\n3. Вычислите разность температур ΔT = T_с - T_в.\n4. По психрометрической таблице найдите относительную влажность φ.\n5. Повторите измерения в других условиях (например, после проветривания).','При температуре сухого термометра T_с = {{dryTemp}} °C и влажного T_в = {{wetTemp}} °C разность составила ΔT = {{deltaT}} °C. Относительная влажность воздуха φ = {{relativeHumidity}}%.','draft','2026-06-13 03:11:48','2026-06-28 09:46:11',6,NULL,NULL,'own'),(24,1,1,'Балансировка рычага','balancing-act','Экспериментально проверить условие равновесия рычага: сумма моментов сил относительно точки опоры равна нулю.','**Момент силы** относительно точки опоры:\n\n$$M = F cdot d$$\n\nгде:\n- $F$ — сила, действующая на рычаг (Н)\n- $d$ — плечо силы — расстояние от точки опоры до линии действия силы (м)\n\n**Условие равновесия рычага:**\n\n$$M_1 = M_2$$\n\nили\n\n$$F_1 cdot d_1 = F_2 cdot d_2$$\n\nВес груза массой $m$: $F = mg$.\n\nИнтерактивная симуляция от PhET помогает наглядно исследовать равновесие рычага под разными грузами и на разных расстояниях:\n\n**[PhET: Балансировка рычага](https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_all.html)**','[\"Рычаг\",\"Грузы разной массы\",\"Линейка\",\"Весы\",\"PhET-симуляция\"]','1. Откройте PhET-симуляцию «Balancing Act» по ссылке в теории.\n2. Установите на левом плече рычага груз массой m₁ на расстоянии d₁ от точки опоры.\n3. Подберите массу m₂ и расстояние d₂ на правом плече так, чтобы рычаг находился в равновесии.\n4. Запишите значения m₁, d₁, m₂, d₂.\n5. Рассчитайте моменты силы слева и справа: M = m·g·d.\n6. Убедитесь, что моменты примерно равны.\n7. Повторите опыт для 3–5 разных комбинаций масс и расстояний.\n8. Постройте график зависимости M_лев от M_прав.','В ходе работы было проверено условие равновесия рычага. Средний левый момент M_лев = {{avgLeftMoment}} Н·см, средний правый момент M_прав = {{avgRightMoment}} Н·см. Разность моментов составила {{avgDiff}} Н·см, что подтверждает правило равновесия: сумма моментов сил относительно точки опоры равна нулю.','draft','2026-06-13 03:34:49','2026-06-28 09:46:37',3,NULL,NULL,'own');
/*!40000 ALTER TABLE `lab_works` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lab_blocks`
--

LOCK TABLES `lab_blocks` WRITE;
/*!40000 ALTER TABLE `lab_blocks` DISABLE KEYS */;
INSERT INTO `lab_blocks` VALUES (1,1,1,'goal','Цель работы','Определить плотность различных твёрдых и жидких веществ экспериментальным путём и сравнить с табличными значениями.',NULL,'2026-06-01 11:52:50'),(2,1,2,'theory','Теоретические сведения','**Плотность** — физическая величина, характеризующая вещество и численно равная отношению массы тела к его объёму.\n\n$$\\rho = \\frac{m}{V}$$\n\ngде:\n- $\\rho$ — плотность вещества (кг/м³)\n- $m$ — масса тела (кг)\n- $V$ — объём тела (м³)\n\n**Единицы измерения:**\n- Основная единица: кг/м³\n- Практическая единица: г/см³\n\n**Методы измерения объёма:**\n1. Для правильных тел — по геометрическим формулам\n2. Для неровных тел — метод вытеснения жидкости (мензурка)\n\n**Оборудование:**\n- Весы\n- Мензурка\n- Исследуемые тела\n- Вода',NULL,'2026-06-01 11:52:50'),(3,1,3,'equipment','Оборудование','[\"Весы\",\"Мензурка\",\"Исследуемые тела\",\"Вода\"]',NULL,'2026-06-01 11:52:50'),(4,1,4,'simulation','Симуляция эксперимента','1. Измерьте массу тела на весах.\n2. Налейте в мензурку воду и запишите начальный объём V₁.\n3. Опустите тело в воду и запишите новый объём V₂.\n4. Вычислите объём тела: V = V₂ − V₁.\n5. Рассчитайте плотность: ρ = m/V.\n6. Повторите измерения 3–5 раз для разных тел.\n7. Сравните полученные значения с табличными.',NULL,'2026-06-01 11:52:50'),(5,1,5,'table','Таблица результатов',NULL,NULL,'2026-06-01 11:52:50'),(6,1,6,'graphs','Графики',NULL,NULL,'2026-06-01 11:52:50'),(7,1,7,'conclusion','Вывод','В ходе работы была определена плотность веществ. Среднее значение плотности составило {{avgDensity}} {{unit}}. Отклонение от табличного значения {{theoreticalDensity}} составило {{errorPercent}}%. Вывод: экспериментальным путём можно определить плотность вещества с погрешностью около {{errorPercent}}%.',NULL,'2026-06-01 11:52:50'),(8,2,1,'goal','Цель работы','Экспериментально исследовать зависимость архимедовой силы от объёма погружённой части тела и от плотности жидкости.',NULL,'2026-06-01 11:52:50'),(9,2,2,'theory','Теоретические сведения','**Архимедова сила** — сила, действующая на тело, погружённое в жидкость или газ, и направленная вверх. Численно равна весу вытесненной жидкости.\n\n$$F_А = \\rho_{ж} \\cdot g \\cdot V_{погр}$$\n\ngде:\n- $F_А$ — архимедова сила (Н)\n- $\\rho_{ж}$ — плотность жидкости (кг/м³)\n- $g ≈ 9,8$ Н/кг — ускорение свободного падения\n- $V_{погр}$ — объём погружённой части тела (м³)\n\n**Закон Архимеда:** на тело, погружённое в жидкость, действует выталкивающая сила, равная весу жидкости в объёме тела.\n\n**Формула через разность весов:**\n$$F_А = P_{воздухе} − P_{жидкости}$$',NULL,'2026-06-01 11:52:50'),(10,2,3,'equipment','Оборудование','[\"Динамометр\",\"Мензурка\",\"Цилиндр металлический\",\"Вода\",\"Раствор соли\"]',NULL,'2026-06-01 11:52:50'),(11,2,4,'simulation','Симуляция эксперимента','**Часть А. Зависимость Fₐ от объёма погружения**\n1. Измерьте вес тела в воздухе P₀.\n2. Погрузите тело на 1/3, измерьте вес P₁.\n3. Погрузите на 2/3, измерьте вес P₂.\n4. Полностью погрузите, измерьте вес P₃.\n5. Рассчитайте Fₐ = P₀ − P для каждого случая.\n\n**Часть Б. Зависимость Fₐ от плотности жидкости**\n1. Повторите опыт в воде.\n2. Повторите опыт в растворе соли (более плотная жидкость).\n3. Сравните величины Fₐ.',NULL,'2026-06-01 11:52:50'),(12,2,5,'table','Таблица результатов',NULL,NULL,'2026-06-01 11:52:50'),(13,2,6,'graphs','Графики',NULL,NULL,'2026-06-01 11:52:50'),(14,2,7,'conclusion','Вывод','Архимедова сила прямо пропорциональна объёму погружённой части тела и плотности жидкости. В воде средняя Fₐ = {{avgFaWater}} Н, в соляном растворе Fₐ = {{avgFaSalt}} Н. Разница объясняется различной плотностью жидкостей.',NULL,'2026-06-01 11:52:50'),(15,3,1,'goal','Цель работы','Экспериментально доказать, что выталкивающая сила не зависит от массы тела при постоянном объёме.',NULL,'2026-06-01 11:52:50'),(16,3,2,'theory','Теоретические сведения','Если два тела имеют одинаковый объём, но разную массу (например, алюминиевый и свинцовый цилиндры одинакового размера), то выталкивающая сила, действующая на них в одной и той же жидкости, будет одинаковой.\n\n$$F_{А1} = F_{А2} = \\rho_{ж} \\cdot g \\cdot V$$\n\nРазличие проявляется в том, что более тяжёлое тело может тонуть, а лёгкое — всплывать, но сама сила Архимеда определяется только объёмом и плотностью жидкости.',NULL,'2026-06-01 11:52:50'),(17,3,3,'equipment','Оборудование','[\"Динамометр\",\"Цилиндры одинакового объёма (разные материалы)\",\"Стакан с водой\"]',NULL,'2026-06-01 11:52:50'),(18,3,4,'simulation','Симуляция эксперимента','1. Возьмите два цилиндра одинакового объёма, но из разных материалов.\n2. Измерьте вес каждого в воздухе.\n3. Поочерёдно полностью погрузите каждый цилиндр в воду.\n4. Измерьте вес каждого в воде.\n5. Рассчитайте Fₐ для каждого.\n6. Сравните результаты.',NULL,'2026-06-01 11:52:50'),(19,3,5,'table','Таблица результатов',NULL,NULL,'2026-06-01 11:52:50'),(20,3,6,'graphs','Графики',NULL,NULL,'2026-06-01 11:52:50'),(21,3,7,'conclusion','Вывод','Выталкивающая сила для тел одинакового объёма {{volume}} м³, но разной массы ({{mass1}} г и {{mass2}} г) оказалась примерно одинаковой: Fₐ₁ = {{fa1}} Н, Fₐ₂ = {{fa2}} Н. Это подтверждает, что Fₐ не зависит от массы тела.',NULL,'2026-06-01 11:52:50'),(22,4,1,'goal','Цель работы','Экспериментально определить работу и мощность электрического тока в цепи с резистором.',NULL,'2026-06-01 11:52:51'),(23,4,2,'theory','Теоретические сведения','**Работа электрического тока** — энергия, которую получает участок цепи от протекающего тока.\n\n$$A = U \\cdot I \\cdot t$$\n\ngде:\n- $A$ — работа тока (Дж)\n- $U$ — напряжение (В)\n- $I$ — сила тока (А)\n- $t$ — время (с)\n\n**Мощность тока:**\n$$P = \\frac{A}{t} = U \\cdot I$$\n\n**Закон Джоуля–Ленца:**\n$$Q = I^2 \\cdot R \\cdot t$$\n\nПри постоянном сопротивлении работа тока идёт на нагрев проводника.',NULL,'2026-06-01 11:52:51'),(24,4,3,'equipment','Оборудование','[\"Источник питания\",\"Амперметр\",\"Вольтметр\",\"Резистор\",\"Ключ\",\"Соединительные провода\",\"Секундомер\"]',NULL,'2026-06-01 11:52:51'),(25,4,4,'simulation','Симуляция эксперимента','1. Соберите электрическую цепь: источник питания → ключ → амперметр → резистор (последовательно). Вольтметр подключите параллельно резистору.\n2. Замкните цепь. Запишите показания амперметра (I) и вольтметра (U).\n3. Включите секундомер. Через t = 60 с разомкните цепь.\n4. Рассчитайте работу тока: A = U·I·t.\n5. Рассчитайте мощность: P = U·I.\n6. Повторите опыт при другом напряжении (измените источник питания).',NULL,'2026-06-01 11:52:51'),(26,4,5,'table','Таблица результатов',NULL,NULL,'2026-06-01 11:52:51'),(27,4,6,'graphs','Графики',NULL,NULL,'2026-06-01 11:52:51'),(28,4,7,'conclusion','Вывод','При напряжении U = {{voltage}} В и силе тока I = {{current}} А за время t = {{time}} с работа тока составила A = {{work}} Дж, мощность P = {{power}} Вт. Увеличение напряжения приводит к росту работы и мощности тока.',NULL,'2026-06-01 11:52:51'),(29,5,1,'goal','Цель работы','Экспериментально определить скорость тела при равномерном прямолинейном движении и построить график зависимости координаты от времени.',NULL,'2026-06-02 06:49:22'),(30,5,2,'theory','Теоретические сведения','При **равномерном прямолинейном движении** тело за равные промежутки времени совершает равные перемещения. Скорость остается постоянной.\n\n**Основные формулы:**\n$$s = v \\cdot t$$\n$$x = x_0 + v \\cdot t$$\n\ngde:\n- $s$ — путь (м)\n- $v$ — скорость (м/с)\n- $t$ — время (с)\n- $x$ — координата тела (м)\n- $x_0$ — начальная координата (м)\n\n**График $x(t)$** при равномерном движении — прямая линия, угловой коэффициент которой равен скорости $v$.\n\n**График $s(t)$** — прямая линия, проходящая через начало координат.',NULL,'2026-06-02 06:49:22'),(31,5,3,'equipment','Оборудование','[\"Секундомер\",\"Измерительная лента\",\"Движущееся тело (тележка)\",\"Линейка\",\"Метки\"]',NULL,'2026-06-02 06:49:22'),(32,5,4,'simulation','Симуляция эксперимента','1. Установите начальное положение тела на измерительной ленте. Запишите x0.\n2. Задайте скорость движения тела.\n3. Запустите движение и одновременно включите секундомер.\n4. Через равные промежутки времени (например, каждые 2 с) фиксируйте координату тела.\n5. Занесите результаты в таблицу.\n6. Постройте график зависимости x(t).\n7. По угловому коэффициенту графика определите скорость движения.',NULL,'2026-06-02 06:49:22'),(33,5,5,'table','Таблица результатов',NULL,NULL,'2026-06-02 06:49:22'),(34,5,6,'graphs','Графики',NULL,NULL,'2026-06-02 06:49:22'),(35,5,7,'conclusion','Вывод','В ходе работы было исследовано равномерное прямолинейное движение. Установлено, что координата тела линейно зависит от времени. Экспериментально определенная скорость составила v = {{avgSpeed}} м/с, что соответствует заданному значению с погрешностью {{errorPercent}}%.',NULL,'2026-06-02 06:49:22'),(36,6,1,'goal','Цель работы','Экспериментально измерить путь и скорость тела, движущегося с постоянным ускорением, и определить величину ускорения.',NULL,'2026-06-02 06:49:22'),(37,6,2,'theory','Теоретические сведения','При **равноускоренном прямолинейном движении** ускорение остается постоянным.\n\n**Основные формулы:**\n$$v = v_0 + a \\cdot t$$\n$$s = v_0 \\cdot t + \\frac{a \\cdot t^2}{2}$$\n$$v^2 - v_0^2 = 2 \\cdot a \\cdot s$$\n\ngde:\n- $v_0$ — начальная скорость (м/с)\n- $a$ — ускорение (м/с²)\n- $t$ — время (с)\n- $s$ — путь (м)\n\n**График $v(t)$** при равноускоренном движении — наклонная прямая. Угловой коэффициент равен ускорению $a$.\n\nЭксперимент часто выполняется на **наклонном желобе** или с помощью **машины Атвуда**.',NULL,'2026-06-02 06:49:22'),(38,6,3,'equipment','Оборудование','[\"Наклонный желоб\",\"Шарик (или тележка)\",\"Секундомер\",\"Линейка\",\"Угломер\",\"Опоры\"]',NULL,'2026-06-02 06:49:22'),(39,6,4,'simulation','Симуляция эксперимента','1. Установите наклонный желоб под углом 10–15° к горизонту.\n2. Отпустите шарик из начальной точки (v0 = 0).\n3. Измерьте время движения до нескольких контрольных точек.\n4. Для каждой точки рассчитайте пройденный путь s и мгновенную скорость v.\n5. Повторите опыт при другом угле наклона (другом ускорении).\n6. Постройте графики s(t) и v(t).\n7. По графику v(t) определите ускорение.',NULL,'2026-06-02 06:49:22'),(40,6,5,'table','Таблица результатов',NULL,NULL,'2026-06-02 06:49:22'),(41,6,6,'graphs','Графики',NULL,NULL,'2026-06-02 06:49:22'),(42,6,7,'conclusion','Вывод','При равноускоренном движении с начальной скоростью v0 = {{v0}} м/с и ускорением a = {{avgAccel}} м/с² путь пропорционален квадрату времени, а скорость линейно зависит от времени. Экспериментально полученное значение ускорения подтверждает теоретический расчет: a = g·sin(α) ≈ {{theoreticalAccel}} м/с².',NULL,'2026-06-02 06:49:22'),(43,7,1,'goal','Цель работы','Экспериментально определить ускорение свободного падения g с помощью математического маятника.',NULL,'2026-06-02 06:49:22'),(44,7,2,'theory','Теоретические сведения','**Математический маятник** — материальная точка, подвешенная на невесомой нерастяжимой нити.\n\nПериод его колебаний:\n$$T = 2\\pi \\sqrt{\\frac{l}{g}}$$\n\ngde:\n- $T$ — период колебаний (с)\n- $l$ — длина нити (м)\n- $g$ — ускорение свободного падения (м/с²)\n\n**Выражение для g:**\n$$g = \\frac{4\\pi^2 l}{T^2}$$\n\nДля повышения точности измеряют время $t$ большого числа колебаний $n$:\n$$T = \\frac{t}{n}$$\n\nПри малых амплитудах (α < 5°) период не зависит от массы груза.',NULL,'2026-06-02 06:49:22'),(45,7,3,'equipment','Оборудование','[\"Штатив с кольцом\",\"Нить с грузом (шарик)\",\"Секундомер\",\"Линейка\",\"Транспортир\"]',NULL,'2026-06-02 06:49:22'),(46,7,4,'simulation','Симуляция эксперимента','1. Подвесьте груз на нити длиной l = 50 см.\n2. Отведите маятник на малый угол (2–3°) и отпустите.\n3. Измерьте время t = 20 полных колебаний.\n4. Вычислите период: T = t/20.\n5. Рассчитайте g по формуле g = 4π²l/T².\n6. Повторите опыт для нитей длиной 75 см, 100 см, 125 см, 150 см.\n7. Постройте график T²(l) и определите g по угловому коэффициенту.',NULL,'2026-06-02 06:49:22'),(47,7,5,'table','Таблица результатов',NULL,NULL,'2026-06-02 06:49:22'),(48,7,6,'graphs','Графики',NULL,NULL,'2026-06-02 06:49:22'),(49,7,7,'conclusion','Вывод','В ходе работы было определено ускорение свободного падения с помощью математического маятника. Среднее значение g = {{avgG}} м/с². Погрешность измерения составила {{errorPercent}}% по сравнению с табличным значением 9,8 м/с². Установлено, что T² пропорционально длине нити l.',NULL,'2026-06-02 06:49:22'),(64,10,1,'goal','Цель работы','Экспериментально проверить закон отражения света: угол падения равен углу отражения.',NULL,'2026-06-12 13:50:00'),(65,10,2,'theory','Теоретические сведения','**Закон отражения света** состоит из двух частей:\n\n1. Падающий луч, отражённый луч и нормаль к поверхности зеркала в точке падения лежат в одной плоскости.\n2. Угол отражения β равен углу падения α:\n\n$$\\alpha = \\beta$$\n\nгде:\n- $\\alpha$ — угол между падающим лучом и нормалью\n- $\\beta$ — угол между отражённым лучом и нормалью\n\nУгол падения изменяется от 0° (луч падает перпендикулярно) до 90° (луч скользит по поверхности).',NULL,'2026-06-12 13:50:00'),(66,10,3,'equipment','Оборудование','[\"Плоское зеркало\",\"Лазерный указатель или источник света с щелью\",\"Транспортир\",\"Лист бумаги\",\"Карандаш\"]',NULL,'2026-06-12 13:50:00'),(67,10,4,'simulation','Симуляция эксперимента','1. Поставьте плоское зеркало вертикально на лист бумаги.\n2. Нарисуйте линию, обозначающую поверхность зеркала.\n3. Восстановите нормаль к поверхности зеркала в точке падения.\n4. Направьте луч света на зеркало под углом α к нормали.\n5. Отметьте направление отражённого луча.\n6. Измерьте угол отражения β.\n7. Повторите опыт для углов падения 20°, 30°, 45°, 60°.\n8. Запишите результаты в таблицу и сравните α и β.',NULL,'2026-06-12 13:50:00'),(68,10,5,'table','Таблица результатов',NULL,NULL,'2026-06-12 13:50:00'),(69,10,6,'graphs','Графики',NULL,NULL,'2026-06-12 13:50:00'),(70,10,7,'conclusion','Вывод','В ходе работы был проверен закон отражения света. Установлено, что угол падения α = {{alpha}}° равен углу отражения β = {{beta}}°. Закон отражения выполняется: α = β.',NULL,'2026-06-12 13:50:00'),(71,11,1,'goal','Цель работы','Наблюдать изменение направления светового луча при переходе из воздуха в прозрачную среду и проверить закон Снеллиуса.',NULL,'2026-06-12 13:50:00'),(72,11,2,'theory','Теоретические сведения','**Закон преломления света (закон Снеллиуса):**\n\nПри переходе света из одной прозрачной среды в другую направление луча изменяется. Отношение синуса угла падения к синусу угла преломления постоянно для двух данных сред:\n\n$$n_1 \\sin\\alpha = n_2 \\sin\\beta$$\n\nгде:\n- $n_1$ — показатель преломления первой среды (для воздуха n₁ ≈ 1)\n- $n_2$ — показатель преломления второй среды\n- $\\alpha$ — угол падения\n- $\\beta$ — угол преломления\n\nЕсли свет переходит из оптически менее плотной среды в более плотную (например, воздух → стекло), то луч приближается к нормали (β < α).',NULL,'2026-06-12 13:50:00'),(73,11,3,'equipment','Оборудование','[\"Плоскопараллельная стеклянная пластина или аквариум с водой\",\"Лазерный указатель\",\"Транспортир\",\"Лист бумаги\",\"Карандаш\"]',NULL,'2026-06-12 13:50:00'),(74,11,4,'simulation','Симуляция эксперимента','1. Поставьте плоскопараллельную пластину на лист бумаги.\n2. Нарисуйте границу раздела сред и восстановите нормаль.\n3. Направьте луч света из воздуха в пластину под углом α.\n4. Отметьте направление преломлённого луча внутри пластины.\n5. Измерьте угол преломления β.\n6. Повторите опыт для разных углов падения.\n7. Сравните отношение sinα/sinβ с показателем преломления среды.',NULL,'2026-06-12 13:50:00'),(75,11,5,'table','Таблица результатов',NULL,NULL,'2026-06-12 13:50:00'),(76,11,6,'graphs','Графики',NULL,NULL,'2026-06-12 13:50:00'),(77,11,7,'conclusion','Вывод','При переходе света из воздуха в среду с показателем преломления n = {{n}} угол преломления β = {{beta}}° отличается от угла падения α = {{alpha}}°, что подтверждает закон Снеллиуса: sinα/sinβ = n.',NULL,'2026-06-12 13:50:00'),(78,12,1,'goal','Цель работы','Определить показатель преломления стекла с помощью плоскопараллельной пластины.',NULL,'2026-06-12 13:50:00'),(79,12,2,'theory','Теоретические сведения','Показатель преломления среды показывает, во сколько раз скорость света в вакууме больше, чем в данной среде. Для стекла типичное значение n ≈ 1,5.\n\nПо закону преломления:\n\n$$n = \\frac{\\sin\\alpha}{\\sin\\beta}$$\n\nгде:\n- $\\alpha$ — угол падения в воздухе\n- $\\beta$ — угол преломления в стекле\n\nДля повышения точности опыт повторяют при нескольких углах падения и находят среднее значение n.',NULL,'2026-06-12 13:50:00'),(80,12,3,'equipment','Оборудование','[\"Плоскопараллельная стеклянная пластина\",\"Лазерный указатель\",\"Транспортир\",\"Лист бумаги\",\"Карандаш\",\"Линейка\"]',NULL,'2026-06-12 13:50:00'),(81,12,4,'simulation','Симуляция эксперимента','1. Поставьте стеклянную пластину на лист бумаги и обведите её контур.\n2. Восстановите нормаль к границе раздела в точке падения.\n3. Направьте луч под углом α = 30° к нормали.\n4. Отметьте падающий и преломлённый лучи.\n5. Измерьте угол преломления β.\n6. Рассчитайте n = sinα/sinβ.\n7. Повторите опыт для углов 40°, 50°, 60°.\n8. Найдите среднее значение n.',NULL,'2026-06-12 13:50:00'),(82,12,5,'table','Таблица результатов',NULL,NULL,'2026-06-12 13:50:00'),(83,12,6,'graphs','Графики',NULL,NULL,'2026-06-12 13:50:00'),(84,12,7,'conclusion','Вывод','Показатель преломления стекла, определённый экспериментально, составил n = {{nMeasured}}. Табличное значение для обычного стекла n ≈ {{nTabular}}. Погрешность измерения объясняется погрешностью измерения углов.',NULL,'2026-06-12 13:50:00'),(99,15,1,'goal','Цель работы','Определить длину световой волны с помощью дифракционной решётки и измерительной линейки.',NULL,'2026-06-12 14:21:04'),(100,15,2,'theory','Теоретические сведения','**Условие главных максимумов дифракционной решётки:**\n\n$$d \\cdot \\sin\\varphi = k \\cdot \\lambda$$\n\nгде:\n- $d$ — период (постоянная) решётки\n- $\\varphi$ — угол дифракции\n- $k$ — порядок спектра ($k = 0, \\pm1, \\pm2, \\ldots$)\n- $\\lambda$ — длина волны\n\nОтсюда:\n\n$$\\lambda = \\frac{d \\cdot \\sin\\varphi}{k}$$\n\nДля повышения точности измеряют углы нескольких порядков спектра и находят среднее значение $\\lambda$.',NULL,'2026-06-12 14:21:04'),(101,15,3,'equipment','Оборудование','[\"Дифракционная решётка\",\"Лазер или спектральная лампа\",\"Штатив\",\"Измерительная линейка\",\"Экран\"]',NULL,'2026-06-12 14:21:04'),(102,15,4,'simulation','Симуляция эксперимента','1. Установите дифракционную решётку перед источником света.\n2. Расположите экран на расстоянии L от решётки.\n3. Измерьте расстояние x от центрального максимума до максимума порядка k.\n4. Рассчитайте угол дифракции: sinφ ≈ x/L (при малых углах) или φ = arctg(x/L).\n5. Рассчитайте длину волны: λ = d·sinφ/k.\n6. Повторите измерения для разных порядков k.\n7. Найдите среднее значение λ.',NULL,'2026-06-12 14:21:04'),(103,15,5,'table','Таблица результатов',NULL,NULL,'2026-06-12 14:21:04'),(104,15,6,'graphs','Графики',NULL,NULL,'2026-06-12 14:21:04'),(105,15,7,'conclusion','Вывод','Длина световой волны, определённая по дифракционной решётке с постоянной d = {{d}} мкм, составила λ = {{lambda}} нм. Полученное значение соответствует видимому диапазону спектра.',NULL,'2026-06-12 14:21:04'),(106,16,1,'goal','Цель работы','Изучить явления интерференции и дифракции света и подтвердить их волновую природу.',NULL,'2026-06-12 14:21:04'),(107,16,2,'theory','Теоретические сведения','**Интерференция света** — явление наложения световых волн, при котором в пространстве возникает устойчивая картина чередования максимумов и минимумов интенсивности.\n\nУсловие максимума при интерференции на двух щелях:\n\n$$\\Delta = d \\cdot \\frac{x}{L} = k\\lambda$$\n\nРасстояние между соседними интерференционными полосами:\n\n$$\\Delta x = \\frac{\\lambda L}{d}$$\n\nгде:\n- $d$ — расстояние между щелями\n- $L$ — расстояние от щелей до экрана\n- $\\lambda$ — длина волны\n\n**Дифракция** — огибание светом препятствий, также являющееся проявлением волновой природы света.',NULL,'2026-06-12 14:21:04'),(108,16,3,'equipment','Оборудование','[\"Установка для наблюдения интерференции\",\"Лазер\",\"Две щели или дифракционная решётка\",\"Экран\",\"Линейка\"]',NULL,'2026-06-12 14:21:04'),(109,16,4,'simulation','Симуляция эксперимента','1. Направьте лазерный луч на две близко расположенные щели.\n2. Наблюдайте интерференционную картину на экране.\n3. Измерьте расстояние L от щелей до экрана.\n4. Измерьте расстояние Δx между соседними светлыми полосами.\n5. Рассчитайте длину волны: λ = Δx·d/L.\n6. Повторите опыт с другим расстоянием L или другими щелями.\n7. Сравните результаты с табличным значением λ для лазера.',NULL,'2026-06-12 14:21:04'),(110,16,5,'table','Таблица результатов',NULL,NULL,'2026-06-12 14:21:04'),(111,16,6,'graphs','Графики',NULL,NULL,'2026-06-12 14:21:04'),(112,16,7,'conclusion','Вывод','Наблюдение интерференционной картины подтверждает волновую природу света. Расстояние между соседними полосами Δx = {{fringeSpacing}} мм, расчётная длина волны λ = {{lambda}} нм.',NULL,'2026-06-12 14:21:04'),(120,18,1,'goal','Цель работы','Экспериментально проверить, что при постоянной температуре произведение давления и объёма газа остаётся постоянным.',NULL,'2026-06-13 03:11:48'),(121,18,2,'theory','Теоретические сведения','**Закон Бойля–Мариотта** утверждает, что при постоянной температуре и неизменной массе идеального газа произведение давления на объём постоянно:\n\n$$pV = \\text{const}$$\n\nили\n\n$$p_1 V_1 = p_2 V_2$$\n\nгде:\n- $p$ — давление газа (Па)\n- $V$ — объём газа (м³)\n\nПри изотермическом расширении газа давление уменьшается обратно пропорционально объёму. График зависимости $p(V)$ — гипербола, а в координатах $p$ от $1/V$ — прямая линия, проходящая через начало координат.',NULL,'2026-06-13 03:11:48'),(122,18,3,'equipment','Оборудование','[\"Цилиндр с поршнем\",\"Манометр\",\"Термостат\",\"Газ\"]',NULL,'2026-06-13 03:11:48'),(123,18,4,'simulation','Симуляция эксперимента','1. Установите температуру газа (должна оставаться постоянной).\n2. Задайте начальный объём газа в цилиндре.\n3. Запишите показания манометра (давление p).\n4. Медленно изменяйте объём, перемещая поршень.\n5. Для каждого положения поршня записывайте объём V и давление p.\n6. Рассчитайте произведение p·V для каждого измерения.\n7. Постройте график p(V) и убедитесь, что он имеет вид гиперболы.',NULL,'2026-06-13 03:11:48'),(124,18,5,'table','Таблица результатов',NULL,NULL,'2026-06-13 03:11:48'),(125,18,6,'graphs','Графики',NULL,NULL,'2026-06-13 03:11:48'),(126,18,7,'conclusion','Вывод','При температуре T = {{temperature}} К проверена изотерма идеального газа. Среднее произведение p·V составило {{avgPV}} Дж. Полученные данные подтверждают закон Бойля–Мариотта: при постоянной температуре pV = const.',NULL,'2026-06-13 03:11:48'),(127,19,1,'goal','Цель работы','Экспериментально установить зависимость объёма фиксированной массы газа от температуры при постоянном давлении.',NULL,'2026-06-13 03:11:48'),(128,19,2,'theory','Теоретические сведения','**Изобарный процесс** — процесс, происходящий при постоянном давлении. Для идеального газа при $p = \\text{const}$:\n\n$$\\frac{V}{T} = \\text{const}$$\n\nили\n\n$$\\frac{V_1}{T_1} = rac{V_2}{T_2}$$\n\nгде:\n- $V$ — объём газа (м³)\n- $T$ — абсолютная температура (К)\n\nПри нагревании газа при постоянном давлении его объём увеличивается прямо пропорционально абсолютной температуре. График $V(T)$ — прямая линия, продолжение которой при $T = 0$ К проходит через начало координат.',NULL,'2026-06-13 03:11:48'),(129,19,3,'equipment','Оборудование','[\"Цилиндр с подвижным поршнем\",\"Термометр\",\"Нагреватель\",\"Газ\"]',NULL,'2026-06-13 03:11:48'),(130,19,4,'simulation','Симуляция эксперимента','1. Установите постоянное давление на поршне (например, атмосферное).\n2. Задайте начальную температуру газа.\n3. Измерьте объём газа в цилиндре.\n4. Постепенно нагревайте газ, поддерживая давление постоянным.\n5. Для каждой температуры записывайте объём V.\n6. Рассчитайте отношение V/T.\n7. Постройте график V(T) и проверьте его линейность.',NULL,'2026-06-13 03:11:48'),(131,19,5,'table','Таблица результатов',NULL,NULL,'2026-06-13 03:11:48'),(132,19,6,'graphs','Графики',NULL,NULL,'2026-06-13 03:11:48'),(133,19,7,'conclusion','Вывод','При постоянном давлении p = {{pressure}} кПа установлена прямая пропорциональность между объёмом и абсолютной температурой газа. Среднее отношение V/T составило {{avgVT}} м³/К, что подтверждает закон Гей-Люссака.',NULL,'2026-06-13 03:11:48'),(141,21,1,'goal','Цель работы','Определить удельную теплоёмкость металлического тела по результатам теплообмена с водой в калориметре.',NULL,'2026-06-13 03:11:48'),(142,21,2,'theory','Теоретические сведения','**Количество теплоты**, необходимое для нагревания тела массой $m$ на $Delta T$ градусов:\n\n$$Q = c \\cdot m \\cdot \\Delta T$$\n\nгде $c$ — **удельная теплоёмкость** вещества (Дж/(кг·°C)).\n\nВ изолированной системе «горячее тело + холодная вода» количество теплоты, отданного телом, равно количеству теплоты, полученному водой:\n\n$$c_{т} m_{т} (T_{т} - T_{р}) = c_{в} m_{в} (T_{р} - T_{в})$$\n\nгде:\n- $T_{т}$ — начальная температура тела\n- $T_{в}$ — начальная температура воды\n- $T_{р}$ — температура в момент теплового равновесия\n- $c_{в} = 4200$ Дж/(кг·°C) — удельная теплоёмкость воды',NULL,'2026-06-13 03:11:48'),(143,21,3,'equipment','Оборудование','[\"Калориметр\",\"Весы\",\"Термометр\",\"Нагретый металлический брусок\",\"Вода\"]',NULL,'2026-06-13 03:11:48'),(144,21,4,'simulation','Симуляция эксперимента','1. Измерьте массу металлического бруска m_т.\n2. Нагрейте брусок до температуры T_т.\n3. Налейте в калориметр холодную воду массой m_в и измерьте её температуру T_в.\n4. Опустите брусок в воду и замкните крышку калориметра.\n5. Дождитесь теплового равновесия и измерьте установившуюся температуру T_р.\n6. Рассчитайте удельную теплоёмкость тела по формуле теплового баланса.\n7. Сравните результат с табличным значением для данного металла.',NULL,'2026-06-13 03:11:48'),(145,21,5,'table','Таблица результатов',NULL,NULL,'2026-06-13 03:11:48'),(146,21,6,'graphs','Графики',NULL,NULL,'2026-06-13 03:11:48'),(147,21,7,'conclusion','Вывод','В результате теплообмена в калориметре установлена температура равновесия T_р = {{equilibriumTemp}} °C. Рассчитанная удельная теплоёмкость металла c = {{specificHeat}} Дж/(кг·°C). Табличное значение для {{materialName}} c_табл = {{tabularHeat}} Дж/(кг·°C), погрешность составила {{errorPercent}}%.',NULL,'2026-06-13 03:11:48'),(148,22,1,'goal','Цель работы','Определить относительную влажность воздуха по показаниям сухого и влажного термометров психрометра.',NULL,'2026-06-13 03:11:48'),(149,22,2,'theory','Теоретические сведения','**Относительная влажность воздуха** — отношение давления водяного пара, содержащегося в воздухе, к давлению насыщенного пара при той же температуре:\n\n$$\\varphi = \\frac{p_{пар}}{p_{нас}} \\cdot 100\\%$$\n\n**Психрометрический метод:** по разности показаний сухого ($T_{с}$) и влажного ($T_{в}$) термометров определяют влажность с помощью психрометрической таблицы.\n\nЧем суше воздух, тем интенсивнее испарение с влажного термометра, тем больше его охлаждение и тем больше разность $\\Delta T = T_{с} - T_{в}$.',NULL,'2026-06-13 03:11:48'),(150,22,3,'equipment','Оборудование','[\"Психрометр\",\"Сухой термометр\",\"Влажный термометр\",\"Психрометрическая таблица\"]',NULL,'2026-06-13 03:11:48'),(151,22,4,'simulation','Симуляция эксперимента','1. Запишите показания сухого термометра T_с.\n2. Запишите показания влажного термометра T_в.\n3. Вычислите разность температур ΔT = T_с - T_в.\n4. По психрометрической таблице найдите относительную влажность φ.\n5. Повторите измерения в других условиях (например, после проветривания).',NULL,'2026-06-13 03:11:48'),(152,22,5,'table','Таблица результатов',NULL,NULL,'2026-06-13 03:11:48'),(153,22,6,'graphs','Графики',NULL,NULL,'2026-06-13 03:11:48'),(154,22,7,'conclusion','Вывод','При температуре сухого термометра T_с = {{dryTemp}} °C и влажного T_в = {{wetTemp}} °C разность составила ΔT = {{deltaT}} °C. Относительная влажность воздуха φ = {{relativeHumidity}}%.',NULL,'2026-06-13 03:11:48'),(162,24,1,'goal','Цель работы','Экспериментально проверить условие равновесия рычага: сумма моментов сил относительно точки опоры равна нулю.',NULL,'2026-06-13 03:34:49'),(163,24,2,'theory','Теоретические сведения','**Момент силы** относительно точки опоры:\n\n$$M = F cdot d$$\n\nгде:\n- $F$ — сила, действующая на рычаг (Н)\n- $d$ — плечо силы — расстояние от точки опоры до линии действия силы (м)\n\n**Условие равновесия рычага:**\n\n$$M_1 = M_2$$\n\nили\n\n$$F_1 cdot d_1 = F_2 cdot d_2$$\n\nВес груза массой $m$: $F = mg$.\n\nИнтерактивная симуляция от PhET помогает наглядно исследовать равновесие рычага под разными грузами и на разных расстояниях:\n\n**[PhET: Балансировка рычага](https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_all.html)**',NULL,'2026-06-13 03:34:49'),(164,24,3,'equipment','Оборудование','[\"Рычаг\",\"Грузы разной массы\",\"Линейка\",\"Весы\",\"PhET-симуляция\"]',NULL,'2026-06-13 03:34:49'),(165,24,4,'simulation','Симуляция эксперимента','1. Откройте PhET-симуляцию «Balancing Act» по ссылке в теории.\n2. Установите на левом плече рычага груз массой m₁ на расстоянии d₁ от точки опоры.\n3. Подберите массу m₂ и расстояние d₂ на правом плече так, чтобы рычаг находился в равновесии.\n4. Запишите значения m₁, d₁, m₂, d₂.\n5. Рассчитайте моменты силы слева и справа: M = m·g·d.\n6. Убедитесь, что моменты примерно равны.\n7. Повторите опыт для 3–5 разных комбинаций масс и расстояний.\n8. Постройте график зависимости M_лев от M_прав.',NULL,'2026-06-13 03:34:49'),(166,24,5,'table','Таблица результатов',NULL,NULL,'2026-06-13 03:34:49'),(167,24,6,'graphs','Графики',NULL,NULL,'2026-06-13 03:34:49'),(168,24,7,'conclusion','Вывод','В ходе работы было проверено условие равновесия рычага. Средний левый момент M_лев = {{avgLeftMoment}} Н·см, средний правый момент M_прав = {{avgRightMoment}} Н·см. Разность моментов составила {{avgDiff}} Н·см, что подтверждает правило равновесия: сумма моментов сил относительно точки опоры равна нулю.',NULL,'2026-06-13 03:34:49');
/*!40000 ALTER TABLE `lab_blocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `simulations`
--

LOCK TABLES `simulations` WRITE;
/*!40000 ALTER TABLE `simulations` DISABLE KEYS */;
INSERT INTO `simulations` VALUES (1,'uniform-linear-motion','Равномерное прямолинейное движение','Анимированное движение тележки по линейке с измерением времени и пути.','mechanics',NULL,'uniform-linear-motion','[{\"key\": \"speed\", \"max\": \"20\", \"min\": \"-20\", \"step\": \"0.5\", \"unit\": \"м/с\", \"label\": \"Скорость\", \"paramType\": \"slider\", \"defaultValue\": \"5\"}, {\"key\": \"time\", \"max\": \"30\", \"min\": \"1\", \"step\": \"0.5\", \"unit\": \"с\", \"label\": \"Время\", \"paramType\": \"slider\", \"defaultValue\": \"10\"}, {\"key\": \"startX\", \"max\": \"50\", \"min\": \"0\", \"step\": \"1\", \"unit\": \"м\", \"label\": \"Начальная координата\", \"paramType\": \"slider\", \"defaultValue\": \"0\"}]',1,'2026-06-21 15:59:20','2026-06-30 10:23:23','own',1,NULL),(2,'uniformly-accelerated-motion','Равноускоренное прямолинейное движение','Модель равноускоренного движения с изменением начальной скорости и ускорения.','mechanics',NULL,'uniformly-accelerated-motion','[{\"key\": \"v0\", \"max\": \"20\", \"min\": \"-20\", \"step\": \"0.5\", \"unit\": \"м/с\", \"label\": \"Начальная скорость\", \"paramType\": \"slider\", \"defaultValue\": \"0\"}, {\"key\": \"angle\", \"max\": \"45\", \"min\": \"-45\", \"step\": \"1\", \"unit\": \"°\", \"label\": \"Угол наклона плоскости\", \"paramType\": \"slider\", \"defaultValue\": \"10\"}, {\"key\": \"time\", \"max\": \"30\", \"min\": \"1\", \"step\": \"0.5\", \"unit\": \"с\", \"label\": \"Время\", \"paramType\": \"slider\", \"defaultValue\": \"5\"}, {\"key\": \"startX\", \"max\": \"50\", \"min\": \"0\", \"step\": \"1\", \"unit\": \"м\", \"label\": \"Начальная координата\", \"paramType\": \"slider\", \"defaultValue\": \"0\"}]',1,'2026-06-21 15:59:20','2026-06-30 10:23:23','own',1,NULL),(214,'free-fall','Свободное падение','Модель свободного падения тела с возможностью задать начальную высоту, скорость и ускорение свободного падения.','mechanics',NULL,'free-fall','[{\"key\": \"h0\", \"max\": \"100\", \"min\": \"0\", \"step\": \"1\", \"unit\": \"м\", \"label\": \"Начальная высота\", \"paramType\": \"slider\", \"defaultValue\": \"20\"}, {\"key\": \"v0\", \"max\": \"20\", \"min\": \"-20\", \"step\": \"0.5\", \"unit\": \"м/с\", \"label\": \"Начальная скорость\", \"paramType\": \"slider\", \"defaultValue\": \"0\"}, {\"key\": \"g\", \"label\": \"Ускорение свободного падения\", \"options\": [{\"label\": \"Земля (9.8 м/с²)\", \"value\": \"9.8\"}, {\"label\": \"Луна (1.62 м/с²)\", \"value\": \"1.62\"}, {\"label\": \"Марс (3.71 м/с²)\", \"value\": \"3.71\"}], \"paramType\": \"select\", \"defaultValue\": \"9.8\"}]',1,'2026-06-28 17:52:48','2026-06-30 10:23:23','own',1,NULL),(266,'faradays-electromagnetic-lab','Закон индукции Фарадея','Позволяет наглядно изучить фундаментальные законы физики: как движение магнита около катушки порождает электрический ток, превращая механическую энергию в электрическую','electrodynamics',NULL,'external-iframe','[{\"key\": \"url\", \"label\": \"URL\", \"paramType\": \"url\", \"defaultValue\": \"https://phet.colorado.edu/sims/html/faradays-electromagnetic-lab/latest/faradays-electromagnetic-lab_all.html\"}]',1,'2026-06-30 18:28:46','2026-06-30 18:28:46','external',0,'PhET');
/*!40000 ALTER TABLE `simulations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `timeline_entries`
--

LOCK TABLES `timeline_entries` WRITE;
/*!40000 ALTER TABLE `timeline_entries` DISABLE KEYS */;
INSERT INTO `timeline_entries` VALUES (1,'physicist','Архимед',-287,-212,'Древнегреческий математик, физик и инженер из Сиракуз. Заложил основы статики и гидростатики, сформулировал закон Архимеда, ввёл понятие центра тяжести, развил методы вычисления площадей и объёмов, предвосхитившие интегральное исчисление.','https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Domenico-Fetti_Archimedes_1620.jpg/500px-Domenico-Fetti_Archimedes_1620.jpg','#f59e0b',1,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(2,'physicist','Герон Александрийский',10,75,'Александрийский инженер, механик и математик. Автор труда «Пневматика», в котором описал множество механических устройств, включая паровой шар — эолипил, первый паровой двигатель в истории. Заложил основы пневматики и прикладной механики.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Hero_of_Alexandria%2C_Belopoiika%2C_Paris%2C_Graec._2442.jpg/500px-Hero_of_Alexandria%2C_Belopoiika%2C_Paris%2C_Graec._2442.jpg','#f97316',2,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(3,'discovery','Эолипил — первый паровой двигатель',60,NULL,'Герон Александрийский описал «эолипил» — шар, вращающийся под действием пара, выходящего из сопел. Это первое в истории устройство, преобразовывающее тепловую энергию в механическое движение.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Greek_title_of_Hero_of_Alexandria%2C_16th_century.png/500px-Greek_title_of_Hero_of_Alexandria%2C_16th_century.png','#f97316',3,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(4,'physicist','Клавдий Птолемей',100,170,'Александрийский астроном, математик и географ. Создал геоцентрическую систему мира, изложенную в «Альмагесте», которая доминировала в астрономии более тысячи лет. Развил тригонометрию и оптику, изучал преломление света.','https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Ptolemy_1476_with_armillary_sphere_model.jpg/500px-Ptolemy_1476_with_armillary_sphere_model.jpg','#8b5cf6',4,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(5,'discovery','Геоцентрическая система мира',150,NULL,'В «Альмагесте» Птолемей обосновал геоцентрическую модель Вселенной: Земля находится в центре, а Солнце, Луна и планеты движутся по сложным орбитам — эпициклам и деферентам.','https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Ptolemy_1476_with_armillary_sphere_model.jpg/500px-Ptolemy_1476_with_armillary_sphere_model.jpg','#8b5cf6',5,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(6,'physicist','Папп Александрийский',290,350,'Александрийский математик и механик. В «Математическом собрании» систематизировал достижения древнегреческой геометрии и механики, ввёл понятия центра тяжести и теоремы, лёгшие в основу проективной геометрии.','https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Pappus_-_Mathematicae_collectiones%2C_1660.jpg/500px-Pappus_-_Mathematicae_collectiones%2C_1660.jpg','#ec4899',6,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(7,'physicist','Гипатия',360,415,'Александрийский философ, математик и астроном. Одна из первых женщин-учёных в истории. Составляла комментарии к трудам по математике и астрономии, конструировала астрономические инструменты и преподавала в Александрийской школе.','https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Hypatia_portrait.png/500px-Hypatia_portrait.png','#f472b6',7,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(8,'physicist','Ариабхата',476,550,'Индийский математик и астроном. Первым предположил, что Земля вращается вокруг своей оси, объяснил причины затмений и ввёл важные математические понятия, включая использование нуля и десятичной системы.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/2064_aryabhata-crp.jpg/500px-2064_aryabhata-crp.jpg','#3b82f6',8,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(9,'discovery','Вращение Земли вокруг оси',500,NULL,'Ариабхата в своём труде «Ариабхатия» (около 500 года) предположил, что Земля вращается вокруг своей оси, объяснил смену дня и ночи и дал первые научные объяснения лунных и солнечных затмений.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/2064_aryabhata-crp.jpg/500px-2064_aryabhata-crp.jpg','#3b82f6',9,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(10,'physicist','Брахмагупта',598,668,'Индийский математик и астроном. Сформулировал правила арифметических операций с нулём и отрицательными числами, развил тригонометрию и астрономию, изучал гравитацию и движение планет.','https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Bas-relief_of_Brahmagupta.jpg/500px-Bas-relief_of_Brahmagupta.jpg','#f43f5e',10,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(11,'physicist','Аль-Хорезми',780,850,'Персидский математик, астроном и географ. Считается «отцом алгебры» благодаря систематизации решения уравнений. Его работы по арифметике способствовали распространению десятичной системы счисления.','https://upload.wikimedia.org/wikipedia/commons/d/dd/Al-Khwarizmi_portrait.jpg','#10b981',11,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(12,'physicist','Аль-Фаргани',805,880,'Арабский астроном и инженер. Составил «Книгу о движении небесных тел», которая вошла в средневековую Европу как основной астрономический учебник. Участвовал в строительстве Нилометра в Каире.','https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Statue_of_Al-Farghani_in_Fergana.jpg/500px-Statue_of_Al-Farghani_in_Fergana.jpg','#06b6d4',12,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(13,'discovery','Основы алгебры',820,NULL,'Аль-Хорезми в труде «Краткая книга об исчислении алгебры и альмукабалы» систематизировал решение линейных и квадратных уравнений. От его имени произошло слово «алгоритм», а от названия книги — «алгебра».','https://upload.wikimedia.org/wikipedia/commons/d/dd/Al-Khwarizmi_portrait.jpg','#10b981',13,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(14,'physicist','Аль-Баттани',858,929,'Арабский астроном и математик. Уточнил длительность солнечного года, измерил наклон эклиптики, составил точные астрономические таблицы. Его работы легли в основу европейской астрономии эпохи Возрождения.','https://upload.wikimedia.org/wikipedia/commons/e/ed/Albategnius.jpeg','#84cc16',14,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(15,'physicist','Ибн аль-Хайсам',965,1040,'Арабский физик, математик и астроном, известный как «отец оптики». Экспериментально исследовал преломление и отражение света, описал работу камеры-обскуры и впервые объяснил механизм зрения.','https://upload.wikimedia.org/wikipedia/commons/9/90/Ibn_al-Haytham.jpg','#eab308',15,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(16,'physicist','Абу Райхан Бируни',973,1048,'Персидский учёный-энциклопедист, физик, астроном и геодезист. Провёл первые научные измерения радиуса Земли, изучил плотность веществ, затмения и вращение Земли. Считается одним из крупнейших учёных средневековья.','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Al-Biruni.jpg/500px-Al-Biruni.jpg','#a855f7',16,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(17,'discovery','Книга об оптике',1021,NULL,'Ибн аль-Хайсам написал семитомный труд «Книга об оптике», в котором экспериментально доказал, что свет распространяется прямолинейно, исследовал преломление и отражение, описал работу камеры-обскуры и объяснил механизм зрения.','https://upload.wikimedia.org/wikipedia/commons/9/90/Ibn_al-Haytham.jpg','#eab308',17,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(18,'physicist','Аль-Заркали',1028,1087,'Андалузский астроном и инструментальщик. Создал точные астрономические таблицы, усовершенствовал астролябию и развил теорию движения планет. Его работы были широко известны в средневековой Европе.','https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Azarquiel_%28MUNCYT%2C_Eulogia_Merle%29.jpg/500px-Azarquiel_%28MUNCYT%2C_Eulogia_Merle%29.jpg','#14b8a6',18,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(19,'physicist','Омар Хайям',1048,1131,'Персидский математик, астроном и поэт. Руководил реформой календаря, составил точные астрономические таблицы, внёс важный вклад в алгебру и теорию параллельных прямых.','https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Omar_Khayyam2.JPG/500px-Omar_Khayyam2.JPG','#f97316',19,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(20,'physicist','Моисей Маймонид',1135,1204,'Испанский философ, врач и учёный. Автор медицинских трактатов, в которых систематизировал знания о болезнях и лечении. Его работы оказали большое влияние на развитие медицины и естественных наук.','https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Maim%C3%B2nides.jpg/500px-Maim%C3%B2nides.jpg','#84cc16',20,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(21,'physicist','Насир ад-Дин ат-Туси',1201,1274,'Персидский астроном, математик и философ. Создал «Зидж-и Илхани» — точные астрономические таблицы, развил тригонометрию как самостоятельную науку, построил обсерваторию в Мараге.','https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Nasir_al-Din_Tusi.jpg/500px-Nasir_al-Din_Tusi.jpg','#8b5cf6',21,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(22,'physicist','Ибн аль-Шатир',1304,1375,'Дамаскский астроном и часовщик. Создал точные модели движения Луны и планет, независимо открывший идеи, близкие к работам Коперника. Усовершенствовал астрономические инструменты.','https://upload.wikimedia.org/wikipedia/commons/c/c4/Ibn-al-shatir2.gif','#ec4899',22,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(23,'physicist','Улугбек',1394,1449,'Тимуридский правитель, астроном и математик. Основал обсерваторию в Самарканде, где были составлены «Зидж-и Джадид-и Гургани» — одни из самых точных астрономических таблиц того времени.','https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Ulugh_Beg_Observatory_Museum_02.jpg/500px-Ulugh_Beg_Observatory_Museum_02.jpg','#06b6d4',23,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(24,'physicist','Николай Кузанский',1401,1464,'Немецкий философ, математик и кардинал. Выдвинул идею о бесконечности Вселенной и относительности движения, предвосхитив гелиоцентрическую картину мира. Изучал математику бесконечного.','https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Nicholas_of_Cusa.jpg/500px-Nicholas_of_Cusa.jpg','#d946ef',24,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(25,'discovery','Самаркандская обсерватория',1420,NULL,'Улугбек построил в Самарканде одну из крупнейших обсерваторий средневековья. С её помощью астрономы получили высокоточные измерения положений звёзд и планет.','https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Ulugh_Beg_Observatory_Museum_02.jpg/500px-Ulugh_Beg_Observatory_Museum_02.jpg','#06b6d4',25,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(26,'physicist','Региомонтан',1436,1476,'Немецкий астроном и математик. Возродил европейскую тригонометрию, составил точные эфемериды и таблицы, подготовил издание «Альмагеста», заложив основы современной астрономии.','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Johannes_Regiomontanus.jpg/500px-Johannes_Regiomontanus.jpg','#f43f5e',26,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(27,'physicist','Николай Коперник',1473,1543,'Польский астроном, математик и каноник. Создал гелиоцентрическую систему мира, в которой Солнце, а не Земля, находится в центре. Его труд «О вращении небесных сфер» (1543) стал одним из важнейших этапов научной революции.','https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Nikolaus_Kopernikus.jpg/500px-Nikolaus_Kopernikus.jpg','#a78bfa',27,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(28,'discovery','Гелиоцентрическая система мира',1543,NULL,'В 1543 году Николай Коперник опубликовал работу «О вращении небесных сфер», в которой поместил Солнце в центр мира. Это положило начало научной революции и радикально изменило представления о месте Земли во Вселенной.','https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Nikolaus_Kopernikus.jpg/500px-Nikolaus_Kopernikus.jpg','#a78bfa',28,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(29,'physicist','Вильям Гильберт',1544,1603,'Английский врач и физик, основоположник научного учения о магнетизме. В 1600 году опубликовал труд «О магните, магнитных телах и о большом магните — Земле», где показал, что Земля ведёт себя как гигантский магнит.','https://upload.wikimedia.org/wikipedia/commons/8/87/William_Gilbert.jpg','#8b5cf6',29,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(30,'physicist','Галилео Галилей',1564,1642,'Итальянский физик, астроном и математик, основоположник экспериментального метода в физике. Создал первый телескоп, открыл спутники Юпитера, фазы Венеры, горы на Луне и солнечные пятна. Сформулировал закон инерции и закон свободного падения.','https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg/500px-Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg','#87CEEB',30,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(31,'physicist','Иоганн Кеплер',1571,1630,'Немецкий математик, астроном и оптик. Открыл три закона движения планет, заложивших основу небесной механики. Его работы позволили Ньютону сформулировать закон всемирного тяготения.','https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Johannes_Kepler.jpg/500px-Johannes_Kepler.jpg','#06b6d4',31,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(32,'discovery','Магнетизм Земли',1600,NULL,'Вильям Гильберт в 1600 году показал, что Земля ведёт себя как гигантский магнит, а магнитное притяжение зависит от природы тела, а не от его движения. Его работа стала первым научным исследованием магнетизма.','https://upload.wikimedia.org/wikipedia/commons/8/87/William_Gilbert.jpg','#8b5cf6',32,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(33,'discovery','Законы Кеплера',1609,NULL,'Иоганн Кеплер открыл три закона движения планет: орбиты эллиптичны, радиус-вектор заметает равные площади за равные промежутки времени, период обращения связан с размером орбиты. Эти законы легли в основу небесной механики.','https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Johannes_Kepler.jpg/500px-Johannes_Kepler.jpg','#06b6d4',33,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(34,'discovery','Телескоп Галилея',1609,NULL,'В 1609 году Галилей собрал свой первый телескоп и направил его на небо. Он открыл горы на Луне, четыре крупнейших спутника Юпитера, фазы Венеры и многочисленные звёзды Млечного Пути — революционные доказательства в пользу гелиоцентрической системы мира.','https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg/500px-Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg','#87CEEB',34,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(35,'physicist','Блез Паскаль',1623,1662,'Французский математик, физик и философ. Сформулировал закон равновесия жидкостей и газов, изучил атмосферное давление, создал первые образцы гидравлического пресса и счётной машины.','https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Blaise_Pascal_2.jpg/500px-Blaise_Pascal_2.jpg','#14b8a6',35,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(36,'physicist','Роберт Бойль',1627,1691,'Английский физик и химик, один из основателей современной химии. Сформулировал закон, связывающий давление и объём газа при постоянной температуре. Исследовал свойства воздуха, вакуума и эластичности.','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Robert_Boyle_0001.jpg/500px-Robert_Boyle_0001.jpg','#84cc16',36,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(37,'physicist','Христиан Гюйгенс',1629,1695,'Голландский физик, математик и астроном. Создал волновую теорию света, изобрёл маятниковые часы, открыл спутник Сатурна — Титан, исследовал центробежную силу и столкновения тел.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Christiaan_Huygens-painting.jpeg/500px-Christiaan_Huygens-painting.jpeg','#0ea5e9',37,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(38,'physicist','Исаак Ньютон',1643,1727,'Английский физик, математик и астроном. Сформулировал законы движения и универсального тяготения, развил исчисление, создал первый зеркальный телескоп. Его «Математические начала натуральной философии» (1687) стали фундаментом классической механики.','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg/500px-Portrait_of_Sir_Isaac_Newton%2C_1689.jpg','#87CEEB',38,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(39,'discovery','Закон Паскаля',1653,NULL,'Блез Паскаль сформулировал закон передачи давления в жидкости и газе: давление, приложенное к поверхности жидкости, передаётся одинаково во все стороны. Этот принцип лёг в основу гидравлических механизмов.','https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Blaise_Pascal_2.jpg/500px-Blaise_Pascal_2.jpg','#14b8a6',39,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(40,'discovery','Закон Бойля-Мариотта',1662,NULL,'Роберт Бойль установил, что при постоянной температуре произведение давления и объёма газа остаётся постоянным. Этот закон стал одним из первых количественных соотношений в физике газов.','https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Robert_Boyle_0001.jpg/500px-Robert_Boyle_0001.jpg','#84cc16',40,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(41,'discovery','Волновая теория света',1678,NULL,'Христиан Гюйгенс предложил волновую теорию света, согласно которой свет распространяется в виде волн в эфире. Его идеи объяснили законы отражения, преломления и двойного лучепреломления.','https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Christiaan_Huygens-painting.jpeg/500px-Christiaan_Huygens-painting.jpeg','#0ea5e9',41,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(42,'discovery','«Математические начала натуральной философии»',1687,NULL,'Книга Исаака Ньютона, в которой изложены три закона движения и закон всемирного тяготения. Этот труд объединил земную и небесную механику и стал основой физики на следующие два с половиной века.','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg/500px-Portrait_of_Sir_Isaac_Newton%2C_1689.jpg','#87CEEB',42,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(43,'physicist','Бенджамин Франклин',1706,1790,'Американский политический деятель, изобретатель и учёный. Проводил опыты с электричеством, доказал грозовую природу молнии, ввёл понятия положительного и отрицательного заряда, изобрёл молниеотвод.','https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/BenFranklinDuplessis.jpg/500px-BenFranklinDuplessis.jpg','#eab308',43,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(44,'physicist','Леонард Эйлер',1707,1783,'Швейцарский и российский математик, механик и физик. Внёс огромный вклад в механику, гидродинамику, оптику и астрономию. Его работы по аналитической механике легли в основу современной физики.','https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Leonhard_Euler_-_Jakob_Emanuel_Handmann_%28Kunstmuseum_Basel%29.jpg/500px-Leonhard_Euler_-_Jakob_Emanuel_Handmann_%28Kunstmuseum_Basel%29.jpg','#f43f5e',44,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(45,'physicist','Михаил Ломоносов',1711,1765,'Русский учёный-естествоиспытатель, химик и физик. Сформулировал закон сохранения массы вещества в химических реакциях, заложил основы физической химии, изучал атмосферное электричество и тепловые явления.','https://upload.wikimedia.org/wikipedia/commons/7/70/Mikhail_Lomonosov.jpg','#01acff',45,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(46,'discovery','Закон сохранения массы вещества',1748,NULL,'В 1748 году Михаил Ломоносов сформулировал фундаментальный закон: масса веществ, участвующих в химической реакции, остаётся неизменной. Этот закон лёг в основу стехиометрии и химической термодинамики.','https://upload.wikimedia.org/wikipedia/commons/7/70/Mikhail_Lomonosov.jpg','#01acff',46,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(47,'discovery','Молния как электричество',1752,NULL,'Бенджамин Франклин в 1752 году провёл знаменитый опыт с воздушным змеем и доказал, что молния — это разряд статического электричества. Это открытие привело к изобретению молниеотвода.','https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/BenFranklinDuplessis.jpg/500px-BenFranklinDuplessis.jpg','#eab308',47,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(48,'physicist','Андре-Мари Ампер',1775,1836,'Французский физик и математик, основоположник электродинамики. Сформулировал закон силы, действующей между проводниками с током, и ввёл понятие электрического тока как физической величины.','https://upload.wikimedia.org/wikipedia/commons/4/4f/Andre-Marie_Ampere.jpg','#d946ef',48,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(49,'physicist','Майкл Фарадей',1791,1867,'Английский физик и химик, один из основоположников электродинамики. Открыл явление электромагнитной индукции, ввёл понятия магнитного поля и силовых линий, создал первые электродвигатели и генераторы.','https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Faraday-Millikan-Gale-1913.jpg/500px-Faraday-Millikan-Gale-1913.jpg','#22c55e',49,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(50,'discovery','Закон Ампера',1820,NULL,'В 1820 году Андре-Мари Ампер установил закон взаимодействия проводников с электрическим током и заложил основы электродинамики. Он также ввёл понятие электрического тока как направленного движения зарядов.','https://upload.wikimedia.org/wikipedia/commons/4/4f/Andre-Marie_Ampere.jpg','#d946ef',50,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(51,'physicist','Джеймс Клерк Максвелл',1831,1879,'Шотландский физик, создатель классической электродинамики. Система уравнений Максвелла описывает электромагнитное поле и предсказала существование электромагнитных волн, распространяющихся со скоростью света.','https://upload.wikimedia.org/wikipedia/commons/4/42/James_Clerk_Maxwell.jpg','#22c55e',51,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(52,'discovery','Электромагнитная индукция',1831,NULL,'В 1831 году Майкл Фарадей открыл явление электромагнитной индукции: изменение магнитного потока в проводящем контуре порождает электрический ток. Это открытие привело к созданию генераторов и трансформаторов.','https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Faraday-Millikan-Gale-1913.jpg/500px-Faraday-Millikan-Gale-1913.jpg','#22c55e',52,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(53,'discovery','Уравнения Максвелла',1865,NULL,'Джеймс Клерк Максвелл объединил электричество, магнетизм и оптику в единую теорию электромагнитного поля. Его уравнения предсказали электромагнитные волны и показали, что свет — это электромагнитная волна.','https://upload.wikimedia.org/wikipedia/commons/4/42/James_Clerk_Maxwell.jpg','#22c55e',53,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(54,'physicist','Мария Склодовская-Кюри',1867,1934,'Польско-французский физик и химик, пионер исследований радиоактивности. Дважды лауреат Нобелевской премии: по физике (1903, совместно с Пьером Кюри и Анри Беккерелем) и по химии (1911). Открыла элементы полоний и радий.','https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/500px-Marie_Curie_c1920.jpg','#a855f7',54,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(55,'physicist','Эрнест Резерфорд',1871,1937,'Новозеландский и британский физик, основоположник ядерной физики. В 1911 году предложил планетарную модель атома с положительно заряженным ядром. Лауреат Нобелевской премии по химии (1908) за исследования распада элементов.','https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Ernest_Rutherford_1908.jpg/500px-Ernest_Rutherford_1908.jpg','#f97316',55,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(56,'physicist','Альберт Эйнштейн',1879,1955,'Немецкий физик-теоретик, автор специальной и общей теорий относительности. В 1905 году объяснил фотоэффект, ввёл понятие кванта света и получил Нобелевскую премию по физике (1921). Его знаменитая формула E = mc² связала массу и энергию.','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/500px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg','#f97316',56,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(57,'physicist','Нильс Бор',1885,1962,'Датский физик-теоретик, основоположник квантовой теории атома. В 1913 году предложил модель атома, в которой электроны движутся по стационарным орбитам и излучают энергию при переходах между ними. Лауреат Нобелевской премии по физике (1922).','https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Niels_Bohr.jpg/500px-Niels_Bohr.jpg','#ec4899',57,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(58,'discovery','Рентгеновские лучи',1895,NULL,'Вильгельм Рентген открыл X-лучи — проникающее излучение, способное проходить через мягкие ткани человека. Открытие произвело революцию в медицине и физике и принесло Рентгену первую Нобелевскую премию по физике (1901).','https://upload.wikimedia.org/wikipedia/commons/4/48/Wilhelm_R%C3%B6ntgen.jpg','#a855f7',58,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(59,'discovery','Специальная теория относительности',1905,NULL,'В 1905 году Альберт Эйнштейн опубликовал работу «К электродинамике движущихся тел», положившую начало СТО. Она пересмотрела понятия пространства и времени, ввела постулат постоянства скорости света и привела к знаменитой формуле E = mc².','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/500px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg','#f97316',59,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(60,'discovery','Фотоэффект',1905,NULL,'Эйнштейн объяснил фотоэффект, предположив, что свет состоит из квантов (фотонов). Работа положила начало квантовой теории и была отмечена Нобелевской премией 1921 года. Уравнение hν = A + Ek связывает энергию фотона с работой выхода и кинетической энергией электрона.','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/500px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg','#f97316',60,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(61,'discovery','Планетарная модель атома',1911,NULL,'В 1911 году Эрнест Резерфорд на основе опытов по рассеянию α-частиц предложил модель атома, в котором почти вся масса и положительный заряд сосредоточены в крошечном ядре, а электроны обращаются вокруг него.','https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Ernest_Rutherford_1908.jpg/500px-Ernest_Rutherford_1908.jpg','#f97316',61,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(62,'discovery','Квантовая модель атома Бора',1913,NULL,'В 1913 году Нильс Бор предложил модель атома, в которой электроны могут находиться только на определённых стационарных орбитах. При переходе между ними атом излучает или поглощает кванты света с энергией hν.','https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Niels_Bohr.jpg/500px-Niels_Bohr.jpg','#ec4899',62,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(63,'physicist','Ричард Фейнман',1918,1988,'Американский физик-теоретик, один из основателей квантовой электродинамики. Лауреат Нобелевской премии (1965). Известен диаграммами Фейнмана, интегралом по траекториям и ясным стилем преподавания физики.','https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Richard_Feynman_1959.png/500px-Richard_Feynman_1959.png','#fdba74',63,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(64,'discovery','Квантовая механика',1925,NULL,'В 1920-е годы Шрёдингер, Гейзенберг, Борн, Дирак и другие создали квантовую механику — фундаментальную теорию поведения микрочастиц. Были введены волновая функция, принцип неопределённости и матричная механика.','https://upload.wikimedia.org/wikipedia/commons/2/2e/Erwin_Schr%C3%B6dinger_%281933%29.jpg','#a855f7',64,'2026-06-19 14:13:39','2026-06-19 14:13:39'),(65,'discovery','Бозон Хиггса',2012,NULL,'4 июля 2012 года коллаборации ATLAS и CMS на Большом адронном коллайдере объявили об открытии новой элементарной частицы — бозона Хиггса. Его существование подтвердило механизм придания массы другим частицам и завершило Стандартную модель.','https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/CMS_Higgs-event.jpg/500px-CMS_Higgs-event.jpg','#fbbf24',65,'2026-06-19 14:13:39','2026-06-19 14:13:39');
/*!40000 ALTER TABLE `timeline_entries` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-01 21:36:10
