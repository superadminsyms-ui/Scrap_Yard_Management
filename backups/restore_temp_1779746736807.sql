-- MySQL dump 10.13  Distrib 8.4.8, for Win64 (x86_64)
--
-- Host: localhost    Database: db_scrapyardm
-- ------------------------------------------------------
-- Server version	8.4.8

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
-- Current Database: `db_scrapyardm`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `db_scrapyardm` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `db_scrapyardm`;

--
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `location` varchar(150) NOT NULL,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
INSERT INTO `company` VALUES (1,_binary '','Kingston','MCMetales');
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `container`
--

DROP TABLE IF EXISTS `container`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `container` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `container_size` enum('FT_20','FT_40') NOT NULL,
  `description` varchar(255) NOT NULL,
  `material_type` enum('ALUMINIUM','ALUMINIUM_CANS','BATTERY','BRASS','CATALYST','CIRCUIT_BOARD','COPPER','IRON','MOTOR','REFER','STAINLESS_STEEL') NOT NULL,
  `material_weight` decimal(38,2) DEFAULT NULL,
  `scrapyard_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK8jjg1l2o17yh9am84hl9jibwj` (`scrapyard_id`),
  CONSTRAINT `FK8jjg1l2o17yh9am84hl9jibwj` FOREIGN KEY (`scrapyard_id`) REFERENCES `scrap_yard` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `container`
--

LOCK TABLES `container` WRITE;
/*!40000 ALTER TABLE `container` DISABLE KEYS */;
INSERT INTO `container` VALUES (1,'FT_20','Iron container','IRON',32206.26,1),(2,'FT_20','alumi container','ALUMINIUM',7495.00,2),(3,'FT_40','Motor container','MOTOR',200.00,1),(4,'FT_20','SSTEEL container','STAINLESS_STEEL',3400.00,1),(5,'FT_20','Catalyst container','CATALYST',503.00,2);
/*!40000 ALTER TABLE `container` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `personal_id` varchar(255) NOT NULL,
  `type_customer` enum('REGULAR','VIP','WHOLESALE') NOT NULL,
  `company_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKig6k2q8xq6vvbxst9q5lvrvo3` (`personal_id`),
  KEY `FKcc6lvs1hfb70cc5rjbyq0m8is` (`company_id`),
  CONSTRAINT `FKcc6lvs1hfb70cc5rjbyq0m8is` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Cameron','96111920333AV','REGULAR',1);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `discount` decimal(38,2) DEFAULT NULL,
  `total_paid` decimal(38,2) NOT NULL,
  `customer_id` bigint NOT NULL,
  `manager_id` bigint NOT NULL,
  `scrapyard_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5e32ukwo9uknwhylogvta4po6` (`customer_id`),
  KEY `FKhto7h9xspb67nnr7728rhyap7` (`manager_id`),
  KEY `FKaqt89ym9vq7qm801f181bc4c0` (`scrapyard_id`),
  CONSTRAINT `FK5e32ukwo9uknwhylogvta4po6` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`),
  CONSTRAINT `FKaqt89ym9vq7qm801f181bc4c0` FOREIGN KEY (`scrapyard_id`) REFERENCES `scrap_yard` (`id`),
  CONSTRAINT `FKhto7h9xspb67nnr7728rhyap7` FOREIGN KEY (`manager_id`) REFERENCES `manager_sy` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
INSERT INTO `invoice` VALUES (1,'2026-05-24 00:23:15.125257',0.00,3500.00,1,1,1),(2,'2026-05-24 00:30:55.310686',0.00,44100.00,1,2,2),(3,'2026-05-24 16:18:26.084938',5000.00,31595.00,1,2,2),(4,'2026-05-24 16:20:29.376822',500.00,12695.00,1,3,2),(5,'2026-05-24 16:41:17.963388',3000.00,64425.00,1,3,2),(6,'2026-05-24 22:09:51.483020',0.00,18000.00,1,4,1),(7,'2026-05-25 12:25:59.815336',0.00,12000.00,1,3,2);
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_detail`
--

DROP TABLE IF EXISTS `invoice_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_detail` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `material_type` enum('ALUMINIUM','ALUMINIUM_CANS','BATTERY','BRASS','CATALYST','CIRCUIT_BOARD','COPPER','IRON','MOTOR','REFER','STAINLESS_STEEL') NOT NULL,
  `unit` enum('KILOGRAMS','POUNDS','TONNES') NOT NULL,
  `unit_price` decimal(38,2) NOT NULL,
  `weight` decimal(38,2) NOT NULL,
  `container_id` bigint NOT NULL,
  `invoice_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKtrkwrt9uoqwwqbaj0qx65dh7p` (`container_id`),
  KEY `FKit1rbx4thcr6gx6bm3gxub3y4` (`invoice_id`),
  CONSTRAINT `FKit1rbx4thcr6gx6bm3gxub3y4` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`id`),
  CONSTRAINT `FKtrkwrt9uoqwwqbaj0qx65dh7p` FOREIGN KEY (`container_id`) REFERENCES `container` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_detail`
--

LOCK TABLES `invoice_detail` WRITE;
/*!40000 ALTER TABLE `invoice_detail` DISABLE KEYS */;
INSERT INTO `invoice_detail` VALUES (1,'IRON','POUNDS',7.00,500.00,1,1),(2,'ALUMINIUM','POUNDS',70.00,630.00,2,2),(3,'ALUMINIUM','POUNDS',65.00,563.00,2,3),(4,'ALUMINIUM','POUNDS',65.00,203.00,2,4),(5,'ALUMINIUM','POUNDS',75.00,899.00,2,5),(6,'STAINLESS_STEEL','POUNDS',30.00,400.00,4,6),(7,'MOTOR','POUNDS',30.00,200.00,3,6),(8,'CATALYST','POUNDS',4000.00,3.00,5,7);
/*!40000 ALTER TABLE `invoice_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manager_sy`
--

DROP TABLE IF EXISTS `manager_sy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manager_sy` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `scrap_yard_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKrpypdpgyy323cwvaycwu59ky1` (`email`),
  KEY `FK8t9w9t5dvxl5gj208ec12bews` (`scrap_yard_id`),
  CONSTRAINT `FK8t9w9t5dvxl5gj208ec12bews` FOREIGN KEY (`scrap_yard_id`) REFERENCES `scrap_yard` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manager_sy`
--

LOCK TABLES `manager_sy` WRITE;
/*!40000 ALTER TABLE `manager_sy` DISABLE KEYS */;
INSERT INTO `manager_sy` VALUES (1,'marcos@gmail.com','Marcos','8765805762',1),(2,'alecia@gmail.com','Alecia','87695362',2),(3,'maria@scrapyard.com','Maria Claudia','56060157',2),(4,'carlita@scrapyard.com','Carlita','24420589',1),(5,'miguelito@migu.com','Miguelito','24420589',1);
/*!40000 ALTER TABLE `manager_sy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movement`
--

DROP TABLE IF EXISTS `movement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movement` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount_moved` decimal(38,2) NOT NULL,
  `destination` varchar(255) NOT NULL,
  `material_type` enum('ALUMINIUM','ALUMINIUM_CANS','BATTERY','BRASS','CATALYST','CIRCUIT_BOARD','COPPER','IRON','MOTOR','REFER','STAINLESS_STEEL') NOT NULL,
  `movement_date` datetime(6) NOT NULL,
  `movement_type` enum('INBOUND','OUTBOUND','TRANSFER') NOT NULL,
  `unit_of_measure` enum('KILOGRAMS','POUNDS','TONNES') NOT NULL,
  `container_id` bigint NOT NULL,
  `manager_id` bigint NOT NULL,
  `scrapyard_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKgoutus6s90a06pma7d8stmkjp` (`container_id`),
  KEY `FK912v9l978v82df9tp9cfdjo57` (`manager_id`),
  KEY `FKscr93b5kixsan1dgsj3ldhn9p` (`scrapyard_id`),
  CONSTRAINT `FK912v9l978v82df9tp9cfdjo57` FOREIGN KEY (`manager_id`) REFERENCES `manager_sy` (`id`),
  CONSTRAINT `FKgoutus6s90a06pma7d8stmkjp` FOREIGN KEY (`container_id`) REFERENCES `container` (`id`),
  CONSTRAINT `FKscr93b5kixsan1dgsj3ldhn9p` FOREIGN KEY (`scrapyard_id`) REFERENCES `scrap_yard` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movement`
--

LOCK TABLES `movement` WRITE;
/*!40000 ALTER TABLE `movement` DISABLE KEYS */;
INSERT INTO `movement` VALUES (1,1000.00,'Linstead INBOUND','IRON','2026-05-24 05:23:37.678358','INBOUND','POUNDS',1,1,1),(2,2500.00,'Clarendon PARK','ALUMINIUM','2026-05-24 05:32:01.680760','INBOUND','POUNDS',2,2,2),(3,2100.00,'Clarendon PARK','ALUMINIUM','2026-05-24 05:38:44.951767','INBOUND','POUNDS',2,3,2),(4,5.00,'Entrada de material a linstead','IRON','2026-05-25 00:06:11.878829','INBOUND','TONNES',1,4,1),(5,600.00,'Entrada de material a Claendon (Aluminio)','ALUMINIUM','2026-05-25 02:55:32.963146','INBOUND','POUNDS',2,3,2),(6,18.00,'Entrada de iron a LInstead','IRON','2026-05-25 03:02:10.890167','INBOUND','TONNES',1,1,1),(7,500.00,'Entrada catalizadores clarendon','CATALYST','2026-05-25 03:28:05.205626','INBOUND','POUNDS',5,2,2),(8,1000.00,'Linstead INBOUND SSTEEL','STAINLESS_STEEL','2026-05-25 03:50:39.496313','INBOUND','POUNDS',4,4,1),(9,20000.00,'Salida de IRON Linstead','IRON','2026-05-25 03:52:36.764270','OUTBOUND','POUNDS',1,4,1),(10,300.00,'Salida ssteel','STAINLESS_STEEL','2026-05-25 03:54:48.054351','OUTBOUND','POUNDS',4,1,1),(11,2300.00,'Entrada ssteel a Linstead de Kemar R','STAINLESS_STEEL','2026-05-25 19:53:14.329416','INBOUND','POUNDS',4,5,1);
/*!40000 ALTER TABLE `movement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scrap_yard`
--

DROP TABLE IF EXISTS `scrap_yard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scrap_yard` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `location` varchar(200) NOT NULL,
  `name` varchar(150) NOT NULL,
  `company_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKi20ghvbadpgckspc9c8v3lfv1` (`name`),
  KEY `FK4q6e1c49v8lnwxwl8urktmmmb` (`company_id`),
  CONSTRAINT `FK4q6e1c49v8lnwxwl8urktmmmb` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scrap_yard`
--

LOCK TABLES `scrap_yard` WRITE;
/*!40000 ALTER TABLE `scrap_yard` DISABLE KEYS */;
INSERT INTO `scrap_yard` VALUES (1,_binary '','Linstead Bypass 244 in corner behind material bussisness','Linstead scrapyard',1),(2,_binary '','Clarendon Park 1','Clarendon scrapyard',1);
/*!40000 ALTER TABLE `scrap_yard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `must_change_password` bit(1) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('MANAGER','SUPERADMIN') NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `manager_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKob8kqyqqgmefl0aco34akdtpe` (`email`),
  UNIQUE KEY `UKds33ccg0h038dtmfkayky6dxt` (`manager_id`),
  CONSTRAINT `FK85bbo795ye2wxt4pj59ur6dtg` FOREIGN KEY (`manager_id`) REFERENCES `manager_sy` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,_binary '','2026-05-24 00:17:15.185472','admin@scrapyard.com',_binary '\0','$2a$10$5P2Ra1MbYv2YUVTQlYZHnOh9AuLWgYByUsXZjDS0AZ74XV0CMGgDG','SUPERADMIN','2026-05-25 11:11:49.555234',NULL),(2,_binary '','2026-05-24 00:22:14.318938','marcos@gmail.com',_binary '\0','$2a$10$QyuIt74Il3tNIM1HkZovne435zeJw2E/KawLZb6690XUdjewtUK8y','MANAGER','2026-05-24 23:21:17.477420',1),(3,_binary '','2026-05-24 00:27:47.820129','alecia@gmail.com',_binary '\0','$2a$10$0F2UXxJUSf2sZX76BH7JKOUPI81eR3KCcuI0QGaGifOa6zh2iPaky','MANAGER','2026-05-25 12:33:44.398058',2),(4,_binary '','2026-05-24 00:36:49.443034','maria@scrapyard.com',_binary '\0','$2a$10$prqFoX1dsfsHcX6.ZvWDtezapgKT2Cw/Adz96GUjYglbpIwA.98pG','MANAGER','2026-05-24 19:18:04.257620',3),(5,_binary '','2026-05-24 17:37:57.023819','admin2@scrapyard.com',_binary '\0','$2a$10$cSYOKZZJX4KwRni94bEZSeTPKxGR7nwpZurd6Ln.y1ZWkMSTKZHHu','SUPERADMIN','2026-05-25 14:15:36.389830',NULL),(6,_binary '','2026-05-24 17:41:07.202794','carlita@scrapyard.com',_binary '\0','$2a$10$UXEw0C93XjbT/aLYDlany.danCVfXi6EnedpncPDGdhu.iizA9z7e','MANAGER','2026-05-24 23:25:02.813061',4),(7,_binary '','2026-05-25 11:05:07.319110','pacofulano@gmail.com',_binary '\0','$2a$10$TXwSLCmS6CvU5b6ruhQqHOKzDKQHpSedwrHcg9dwbL21N5rsstlsC','SUPERADMIN','2026-05-25 11:05:57.468426',NULL),(8,_binary '','2026-05-25 14:50:44.244269','miguelito@migu.com',_binary '\0','$2a$10$XGIKRZ8ODYp41ukO47L0j./9TWWV2GdqmiYfF2wB7ZeueKrFUtbZm','MANAGER','2026-05-25 14:51:47.278082',5);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'db_scrapyardm'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-25 16:59:56
