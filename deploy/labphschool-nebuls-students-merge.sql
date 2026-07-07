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
-- Dumping data for table `local_users`
--

LOCK TABLES `local_users` WRITE;
/*!40000 ALTER TABLE `local_users` DISABLE KEYS */;
INSERT IGNORE INTO `local_users` VALUES (12,'st1','$2b$12$9vQ8v6uf72.qhi/F76ghveK05pbT3IDlR8vljf25ZynwHn15uqiHK','Ivan_test',2,1,'active','avatar-3','2026-07-01 13:28:08','2026-07-06 22:09:47','2026-07-06 21:37:53','Привет)) **Любимая сестра)**)))\n\nНовая тема для изучения','2026-07-02 13:33:14','2026-07-06 22:09:47','2026-07-01 10:34:20','2026-07-05 12:26:34'),(13,'arinakot','$2b$12$7GkfVDLN0EggXlWlQlYaguPWCtEKP8lXTzIwuPoRydDXVw4UbrHhm','Arina Kot',2,1,'active',NULL,'2026-07-02 10:07:27','2026-07-06 05:13:49','2026-07-06 05:13:49','Привет, Арина!\n\nРада приветствовать тебя на платформе **nebuls**!\n\nЭта Луна будет доставлять тебе важную информацию, комментарии и задания от учителя. Заглядывай сюда — здесь появляется всё самое нужное по домашней работе и учебе.\n\nНапример, задания на повторение https://fizika23.ru/oge/oge_01_01.html \nПрорешай и пришли мне ответы, можно сделать скрин и писать на фотографиях сразу ответы','2026-07-02 11:55:06','2026-07-06 05:12:34','2026-07-06 05:12:36',NULL),(14,'venguramargo','$2b$12$F2pLgapIXUCFaFPfbio76udV/VT3fqFL2V4HSs7N9SwIfnaAPg5eK','Маргарита',2,1,'active',NULL,'2026-07-02 11:13:38','2026-07-02 08:16:15','2026-07-02 08:15:31','Привет! Марго))\n\n\nРада приветствовать тебя на платформе **nebuls**!\n\nЭта Луна будет доставлять тебе важную информацию, комментарии и задания от учителя. Заглядывай сюда — здесь появляется всё самое нужное по домашней работе и учебе.','2026-07-02 08:15:45','2026-07-02 08:16:12','2026-07-02 08:16:15',NULL),(15,'milhail1234','$2b$12$MBrMId0.Fom.IxdvI4.YZupivhXdxbZOnbgdQZXyFbsbL3sheYY7i','Михаил',2,1,'active',NULL,'2026-07-05 13:03:09','2026-07-05 10:05:46','2026-07-05 10:05:11','Привет, Михаил! \n\nРада приветствовать тебя на платформе **nebuls**!\n\nЭта Луна будет доставлять тебе важную информацию, комментарии и задания от учителя. Заглядывай сюда — здесь появляется всё самое нужное по домашней работе и учебе.','2026-07-05 10:03:53','2026-07-05 10:05:32','2026-07-05 10:05:46',NULL),(16,'velia','$2b$12$h395db6.XECaCPKOTFbvNOWEIUAXoSsBBWoFrxiuyDEPdcl5SN6um','Анна',2,1,'active',NULL,'2026-07-06 16:34:35','2026-07-06 13:40:37','2026-07-06 13:40:00','Привет, Анна! \n\nРада приветствовать тебя на платформе **nebuls**!\n\nЭта Луна будет доставлять тебе важную информацию, комментарии и задания от учителя. Заглядывай сюда — здесь появляется всё самое нужное по домашней работе и учебе.','2026-07-06 13:35:11','2026-07-06 13:40:33','2026-07-06 13:40:37',NULL);
/*!40000 ALTER TABLE `local_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT IGNORE INTO `enrollments` VALUES (8,12,1,'active',NULL,NULL,NULL,'2026-07-01 13:29:11',NULL,1),(9,13,1,'active',NULL,NULL,NULL,'2026-07-02 10:10:37',NULL,1),(10,14,1,'active',NULL,NULL,NULL,'2026-07-02 11:27:06',NULL,1),(11,14,5,'active',NULL,NULL,NULL,'2026-07-02 11:27:26',NULL,1),(12,15,1,'active',NULL,NULL,NULL,'2026-07-05 13:04:46',NULL,1),(13,15,3,'active',NULL,NULL,NULL,'2026-07-05 13:06:59',NULL,1),(14,16,1,'active',NULL,NULL,NULL,'2026-07-06 16:35:53',NULL,1);
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `assigned_lab_works`
--

LOCK TABLES `assigned_lab_works` WRITE;
/*!40000 ALTER TABLE `assigned_lab_works` DISABLE KEYS */;
INSERT IGNORE INTO `assigned_lab_works` VALUES (10,8,12,5,1,'completed',5,1,'2026-07-01 13:29:26','2026-07-01 11:22:33','2026-07-01 13:29:26','2026-07-01 11:22:33',NULL,'2026-07-01 10:38:07'),(11,8,12,6,2,'assigned',5,1,'2026-07-01 13:29:50',NULL,'2026-07-01 13:29:50','2026-07-02 13:17:16',NULL,NULL),(12,9,13,5,1,'assigned',NULL,1,'2026-07-02 10:11:54',NULL,'2026-07-02 10:11:54','2026-07-02 10:11:54',NULL,NULL);
/*!40000 ALTER TABLE `assigned_lab_works` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `assigned_problems`
--

LOCK TABLES `assigned_problems` WRITE;
/*!40000 ALTER TABLE `assigned_problems` DISABLE KEYS */;
INSERT IGNORE INTO `assigned_problems` VALUES (10,8,12,5,1,'completed',5,1,'2026-07-02 16:06:05','2026-07-02 13:38:33','2026-07-02 16:06:05','2026-07-03 22:52:37','5,32*10^-23',NULL,'2026-07-02 13:37:56','Гууууд',NULL);
/*!40000 ALTER TABLE `assigned_problems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `assigned_jupyter_notebooks`
--

LOCK TABLES `assigned_jupyter_notebooks` WRITE;
/*!40000 ALTER TABLE `assigned_jupyter_notebooks` DISABLE KEYS */;
/*!40000 ALTER TABLE `assigned_jupyter_notebooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `student_progress`
--

LOCK TABLES `student_progress` WRITE;
/*!40000 ALTER TABLE `student_progress` DISABLE KEYS */;
INSERT IGNORE INTO `student_progress` VALUES (8,12,71,'completed','completed','completed','completed','2026-07-01 10:29:15','2026-07-02 13:06:29',NULL,'2026-07-01 13:29:15','2026-07-02 13:06:29'),(9,13,71,'completed','completed','pending','in_progress','2026-07-02 07:12:07',NULL,NULL,'2026-07-02 10:10:42','2026-07-02 07:12:07'),(10,13,72,'completed','completed','pending','in_progress','2026-07-02 07:12:09',NULL,NULL,'2026-07-02 10:10:45','2026-07-02 07:12:09'),(11,13,78,'completed','pending','pending','in_progress','2026-07-02 07:12:15',NULL,NULL,'2026-07-02 10:10:49','2026-07-02 07:12:15'),(12,13,75,'completed','completed','pending','in_progress','2026-07-02 07:12:10',NULL,NULL,'2026-07-02 10:10:55','2026-07-02 07:12:10'),(13,13,76,'completed','completed','pending','in_progress','2026-07-02 07:12:14',NULL,NULL,'2026-07-02 10:10:59','2026-07-02 07:12:14'),(14,14,71,'completed','pending','pending','in_progress','2026-07-02 11:57:11',NULL,NULL,'2026-07-02 11:27:17','2026-07-02 11:57:11'),(15,14,72,'completed','pending','pending','in_progress','2026-07-02 11:57:13',NULL,NULL,'2026-07-02 14:57:06','2026-07-02 11:57:13'),(16,14,78,'completed','pending','pending','in_progress','2026-07-02 11:57:23',NULL,NULL,'2026-07-02 14:57:20','2026-07-02 11:57:23'),(17,14,32,'completed','pending','pending','in_progress','2026-07-02 12:24:02',NULL,NULL,'2026-07-02 15:23:59','2026-07-02 12:24:02'),(18,12,78,'completed','completed','pending','not_started',NULL,NULL,NULL,'2026-07-02 16:06:25','2026-07-02 13:06:30'),(19,15,71,'completed','pending','pending','completed','2026-07-05 10:05:07','2026-07-05 10:05:36',NULL,'2026-07-05 13:04:54','2026-07-05 10:05:36'),(20,15,72,'completed','pending','pending','completed','2026-07-05 10:05:09','2026-07-05 10:05:50',NULL,'2026-07-05 13:04:56','2026-07-05 10:05:50'),(21,15,75,'pending','pending','pending','in_progress','2026-07-05 10:05:13',NULL,NULL,'2026-07-05 13:04:58','2026-07-05 10:05:13'),(22,15,76,'completed','pending','pending','not_started',NULL,NULL,NULL,'2026-07-05 13:05:01','2026-07-05 13:05:01'),(23,15,77,'completed','pending','pending','not_started',NULL,NULL,NULL,'2026-07-05 13:05:03','2026-07-05 13:05:03'),(24,15,78,'completed','pending','pending','in_progress','2026-07-05 10:06:05',NULL,NULL,'2026-07-05 13:05:04','2026-07-05 10:06:05'),(25,15,23,'completed','completed','pending','in_progress','2026-07-05 10:07:05',NULL,NULL,'2026-07-05 13:07:04','2026-07-05 10:30:23'),(26,15,24,'completed','pending','pending','in_progress','2026-07-05 10:07:08',NULL,NULL,'2026-07-05 13:07:07','2026-07-05 10:07:19'),(27,15,26,'completed','pending','pending','in_progress','2026-07-05 10:07:16',NULL,NULL,'2026-07-05 13:07:15','2026-07-05 10:07:21'),(28,16,71,'completed','pending','pending','in_progress','2026-07-06 13:35:59',NULL,NULL,'2026-07-06 16:35:57','2026-07-06 13:35:59'),(29,16,78,'completed','pending','pending','in_progress','2026-07-06 13:36:04',NULL,NULL,'2026-07-06 16:36:01','2026-07-06 13:36:04'),(30,12,72,'completed','pending','pending','not_started',NULL,NULL,NULL,'2026-07-07 02:28:15','2026-07-07 02:28:15'),(31,12,75,'completed','pending','pending','not_started',NULL,NULL,NULL,'2026-07-07 02:28:17','2026-07-07 02:28:17'),(32,12,76,'completed','pending','pending','not_started',NULL,NULL,NULL,'2026-07-07 02:28:20','2026-07-07 02:28:20');
/*!40000 ALTER TABLE `student_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lab_progress`
--

LOCK TABLES `lab_progress` WRITE;
/*!40000 ALTER TABLE `lab_progress` DISABLE KEYS */;
INSERT IGNORE INTO `lab_progress` VALUES (8,12,5,'training','completed','{\"externalData\": {\"graphs\": [], \"tables\": []}}','[{\"s\": \"1.1\", \"v\": 2, \"x\": \"14.1\", \"№\": 1, \"time\": \"0.5\", \"startX\": 13}, {\"s\": \"1.9\", \"v\": 2, \"x\": \"14.9\", \"№\": 2, \"time\": \"0.9\", \"startX\": 13}, {\"s\": \"2.6\", \"v\": 2, \"x\": \"15.6\", \"№\": 3, \"time\": \"1.3\", \"startX\": 13}, {\"s\": \"3.3\", \"v\": 2, \"x\": \"16.3\", \"№\": 4, \"time\": \"1.6\", \"startX\": 13}, {\"s\": \"3.9\", \"v\": 2, \"x\": \"16.9\", \"№\": 5, \"time\": \"2.0\", \"startX\": 13}, {\"s\": \"4.7\", \"v\": 2, \"x\": \"17.7\", \"№\": 6, \"time\": \"2.4\", \"startX\": 13}, {\"s\": \"5.4\", \"v\": 2, \"x\": \"18.4\", \"№\": 7, \"time\": \"2.7\", \"startX\": 13}, {\"s\": \"6.2\", \"v\": 2, \"x\": \"19.2\", \"№\": 8, \"time\": \"3.1\", \"startX\": 13}, {\"s\": \"6.9\", \"v\": 2, \"x\": \"19.9\", \"№\": 9, \"time\": \"3.4\", \"startX\": 13}, {\"s\": \"7.6\", \"v\": 2, \"x\": \"20.6\", \"№\": 10, \"time\": \"3.8\", \"startX\": 13}, {\"s\": \"8.4\", \"v\": 2, \"x\": \"21.4\", \"№\": 11, \"time\": \"4.2\", \"startX\": 13}, {\"s\": \"9.1\", \"v\": 2, \"x\": \"22.1\", \"№\": 12, \"time\": \"4.5\", \"startX\": 13}, {\"s\": \"9.8\", \"v\": 2, \"x\": \"22.8\", \"№\": 13, \"time\": \"4.9\", \"startX\": 13}, {\"s\": \"10.5\", \"v\": 2, \"x\": \"23.5\", \"№\": 14, \"time\": \"5.3\", \"startX\": 13}, {\"s\": \"11.2\", \"v\": 2, \"x\": \"24.2\", \"№\": 15, \"time\": \"5.6\", \"startX\": 13}]','Полученная зависимость координаты от времени соответствует кинематическому закону x(t) = v*t + x0 (прямолинейному движению без ускорения)\nv = 2 м/c',5,NULL,'2026-07-01 10:38:07','2026-07-01 11:22:33','2026-07-01 13:38:06','2026-07-01 11:22:33');
/*!40000 ALTER TABLE `lab_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `student_links`
--

LOCK TABLES `student_links` WRITE;
/*!40000 ALTER TABLE `student_links` DISABLE KEYS */;
INSERT IGNORE INTO `student_links` VALUES (4,13,'https://telemost.yandex.ru/j/36319199364662','Телемост','yandex_telemost',1,1,'2026-07-02 10:09:09','2026-07-02 10:09:09'),(5,16,'https://telemost.yandex.ru/j/77054445741433',NULL,'yandex_telemost',1,1,'2026-07-06 16:36:49','2026-07-06 16:36:49'),(6,15,'https://telemost.yandex.ru/j/19950617583628',NULL,'yandex_telemost',1,1,'2026-07-06 16:37:19','2026-07-06 16:37:19'),(7,14,'https://telemost.yandex.ru/j/43810568985676',NULL,'yandex_telemost',1,1,'2026-07-06 16:37:42','2026-07-06 16:37:42');
/*!40000 ALTER TABLE `student_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT IGNORE INTO `notifications` VALUES (26,12,'lab','Назначена новая лабораторная работа','Вам назначена новая лабораторная работа. Перейдите во вкладку «Мои Лабораторные».',1,10,'2026-07-01 13:29:26'),(27,12,'lab','Назначена новая лабораторная работа','Вам назначена новая лабораторная работа. Перейдите во вкладку «Мои Лабораторные».',1,11,'2026-07-01 13:29:50'),(28,13,'lab','Назначена новая лабораторная работа','Вам назначена новая лабораторная работа. Перейдите во вкладку «Мои Лабораторные».',1,12,'2026-07-02 10:11:54'),(29,12,'problem','Назначена новая задача','Вам назначена новая задача. Перейдите во вкладку «Мои Задачи».',1,10,'2026-07-02 16:06:05');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-07 15:19:51
