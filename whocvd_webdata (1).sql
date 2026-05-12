-- phpMyAdmin SQL Dump
-- Database: whocvd_webdata
-- CVD Risk Assessment System (PCM × Silpakorn)
-- Generated: 12 May 2026
--
-- ============================================================
-- Notes:
--  - รองรับทั้งจังหวัดไทย และ ประเทศต่างประเทศ
--  - เก็บผลการประเมินความเสี่ยง (status_code + risk_percent)
--  - พร้อม import เข้า phpMyAdmin ได้ทันที
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `whocvd_webdata`
--

-- ============================================================
-- Drop existing tables (เผื่อมีอยู่แล้ว)
-- ============================================================
DROP TABLE IF EXISTS `form_lab`;
DROP TABLE IF EXISTS `form_nonlab`;
DROP TABLE IF EXISTS `district`;
DROP TABLE IF EXISTS `province`;
DROP TABLE IF EXISTS `region`;
DROP TABLE IF EXISTS `country`;
DROP TABLE IF EXISTS `admins`;

-- ============================================================
-- Table structure for table `admins`
-- ============================================================
CREATE TABLE `admins` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `admins` (`admin_id`, `username`, `password_hash`, `email`, `created_at`) VALUES
(1, 'admin1', '$2b$10$Bjp.JRx/AYEm9WOlyQNKR.2QN07Qz5SR79fgGgDeWhZZ3UOtjpqUO', 'test456@xmail.com', '2025-07-25 12:01:12');

-- ============================================================
-- Table structure for table `region`  (Master ภูมิภาคไทย)
-- ============================================================
CREATE TABLE `region` (
  `RegionID` varchar(50) NOT NULL,
  `RegionName` varchar(50) NOT NULL,
  PRIMARY KEY (`RegionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `region` (`RegionID`, `RegionName`) VALUES
('1', 'ภาคกลาง'),
('2', 'ภาคเหนือ'),
('3', 'ภาคใต้'),
('4', 'ภาคตะวันออกเฉียงเหนือ'),
('5', 'ภาคตะวันออก'),
('6', 'ภาคตะวันตก');

-- ============================================================
-- Table structure for table `country`  (Master ประเทศ)
-- ============================================================
CREATE TABLE `country` (
  `countryID` varchar(10) NOT NULL,
  `countryName` varchar(100) NOT NULL,
  `alpha2_code` varchar(10) NOT NULL,
  PRIMARY KEY (`countryID`),
  KEY `idx_country_name` (`countryName`),
  KEY `idx_alpha2_code` (`alpha2_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `country` (`countryID`, `countryName`, `alpha2_code`) VALUES
('360', 'Indonesia', 'ID'),
('458', 'Malaysia', 'MY'),
('608', 'Philippines', 'PH'),
('702', 'Singapore', 'SG'),
('704', 'Vietnam', 'VN'),
('418', 'Lao PDR', 'LA'),
('116', 'Cambodia', 'KH'),
('104', 'Myanmar', 'MM');

-- ============================================================
-- Table structure for table `province`  (Master จังหวัดไทย)
-- ============================================================
CREATE TABLE `province` (
  `ProvinceID` varchar(50) NOT NULL,
  `ProvinceName` varchar(255) DEFAULT NULL,
  `RegionID` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ProvinceID`),
  KEY `idx_province_name` (`ProvinceName`),
  KEY `idx_region_id` (`RegionID`),
  CONSTRAINT `fk_province_region` FOREIGN KEY (`RegionID`) REFERENCES `region` (`RegionID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `province` (`ProvinceID`, `ProvinceName`, `RegionID`) VALUES
('10', 'กรุงเทพมหานคร', '1'),
('11', 'สมุทรปราการ', '1'),
('12', 'นนทบุรี', '1'),
('13', 'ปทุมธานี', '1'),
('14', 'พระนครศรีอยุธยา', '1'),
('15', 'อ่างทอง', '1'),
('16', 'ลพบุรี', '1'),
('17', 'สิงห์บุรี', '1'),
('18', 'ชัยนาท', '1'),
('19', 'สระบุรี', '1'),
('20', 'ชลบุรี', '5'),
('21', 'ระยอง', '5'),
('22', 'จันทบุรี', '5'),
('23', 'ตราด', '5'),
('24', 'ฉะเชิงเทรา', '5'),
('25', 'ปราจีนบุรี', '5'),
('26', 'นครนายก', '5'),
('27', 'สระแก้ว', '5'),
('30', 'นครราชสีมา', '4'),
('31', 'บุรีรัมย์', '4'),
('32', 'สุรินทร์', '4'),
('33', 'ศรีสะเกษ', '4'),
('34', 'อุบลราชธานี', '4'),
('35', 'ยโสธร', '4'),
('36', 'ชัยภูมิ', '4'),
('37', 'อำนาจเจริญ', '4'),
('38', 'บึงกาฬ', '4'),
('39', 'หนองบัวลำภู', '4'),
('40', 'ขอนแก่น', '4'),
('41', 'อุดรธานี', '4'),
('42', 'เลย', '4'),
('43', 'หนองคาย', '4'),
('44', 'มหาสารคาม', '4'),
('45', 'ร้อยเอ็ด', '4'),
('46', 'กาฬสินธุ์', '4'),
('47', 'สกลนคร', '4'),
('48', 'นครพนม', '4'),
('49', 'มุกดาหาร', '4'),
('50', 'เชียงใหม่', '2'),
('51', 'ลำพูน', '2'),
('52', 'ลำปาง', '2'),
('53', 'อุตรดิตถ์', '2'),
('54', 'แพร่', '2'),
('55', 'น่าน', '2'),
('56', 'พะเยา', '2'),
('57', 'เชียงราย', '2'),
('58', 'แม่ฮ่องสอน', '2'),
('60', 'นครสวรรค์', '1'),
('61', 'อุทัยธานี', '1'),
('62', 'กำแพงเพชร', '1'),
('63', 'ตาก', '6'),
('64', 'สุโขทัย', '1'),
('65', 'พิษณุโลก', '1'),
('66', 'พิจิตร', '1'),
('67', 'เพชรบูรณ์', '1'),
('70', 'ราชบุรี', '6'),
('71', 'กาญจนบุรี', '6'),
('72', 'สุพรรณบุรี', '1'),
('73', 'นครปฐม', '1'),
('74', 'สมุทรสาคร', '1'),
('75', 'สมุทรสงคราม', '1'),
('76', 'เพชรบุรี', '6'),
('77', 'ประจวบคีรีขันธ์', '6'),
('80', 'นครศรีธรรมราช', '3'),
('81', 'กระบี่', '3'),
('82', 'พังงา', '3'),
('83', 'ภูเก็ต', '3'),
('84', 'สุราษฎร์ธานี', '3'),
('85', 'ระนอง', '3'),
('86', 'ชุมพร', '3'),
('90', 'สงขลา', '3'),
('91', 'สตูล', '3'),
('92', 'ตรัง', '3'),
('93', 'พัทลุง', '3'),
('94', 'ปัตตานี', '3'),
('95', 'ยะลา', '3'),
('96', 'นราธิวาส', '3');

-- ============================================================
-- Table structure for table `district`  (Master อำเภอ)
-- ============================================================
CREATE TABLE `district` (
  `DistrictID` varchar(50) NOT NULL,
  `DistrictName` varchar(255) DEFAULT NULL,
  `ProvinceID` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`DistrictID`),
  KEY `idx_district_name` (`DistrictName`),
  KEY `idx_province_id` (`ProvinceID`),
  CONSTRAINT `fk_district_province` FOREIGN KEY (`ProvinceID`) REFERENCES `province` (`ProvinceID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `district` (`DistrictID`, `DistrictName`, `ProvinceID`) VALUES
('1001', 'เขตพระนคร', '10'),
('1002', 'เขตดุสิต', '10'),
('1003', 'เขตหนองจอก', '10'),
('1004', 'เขตบางรัก', '10'),
('1005', 'เขตบางเขน', '10');

-- ============================================================
-- Table structure for table `form_nonlab`
-- การประเมินความเสี่ยงแบบไม่ใช้ผลตรวจเลือด
-- ============================================================
CREATE TABLE `form_nonlab` (
  `id` int(11) NOT NULL AUTO_INCREMENT,

  -- ข้อมูลส่วนบุคคล
  `name` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `sex` tinyint(1) NOT NULL COMMENT '0=หญิง, 1=ชาย',
  `age` int(11) NOT NULL,
  `smoking_status` tinyint(1) NOT NULL COMMENT '0=ไม่สูบ, 1=สูบ',

  -- ตัวชี้วัดสุขภาพ
  `sbp1` int(11) NOT NULL COMMENT 'ความดันค่าบนครั้งที่ 1 (mmHg)',
  `sbp2` int(11) NOT NULL COMMENT 'ความดันค่าบนครั้งที่ 2 (mmHg)',
  `sbptotal` int(10) NOT NULL COMMENT 'ค่าเฉลี่ย SBP',
  `weight` int(11) NOT NULL COMMENT 'น้ำหนัก (kg)',
  `height` int(11) NOT NULL COMMENT 'ส่วนสูง (cm)',

  -- ที่อยู่ — รองรับทั้งจังหวัดไทย / ต่างประเทศ
  `location_type` enum('province','country') NOT NULL DEFAULT 'province' COMMENT 'province=ไทย, country=ต่างประเทศ',
  `ProvinceID` varchar(50) DEFAULT NULL COMMENT 'FK → province.ProvinceID',
  `ProvinceName` varchar(255) DEFAULT NULL COMMENT 'snapshot ชื่อจังหวัด',
  `RegionID` varchar(50) DEFAULT NULL COMMENT 'FK → region.RegionID',
  `countryID` varchar(10) DEFAULT NULL COMMENT 'FK → country.countryID',
  `countryName` varchar(100) DEFAULT NULL COMMENT 'snapshot ชื่อประเทศ',
  `province` varchar(100) NOT NULL COMMENT 'ค่ารวม (backward compat)',

  -- ผลการประเมิน
  `risk_percent` decimal(5,2) DEFAULT NULL COMMENT 'ค่าความเสี่ยง % (เช่น 12.50)',
  `status_code` varchar(20) DEFAULT NULL COMMENT 'very_low / low / moderate / high / very_high',
  `status_label_th` varchar(50) DEFAULT NULL COMMENT 'ป้ายภาษาไทย',
  `status_label_en` varchar(50) DEFAULT NULL COMMENT 'ป้ายภาษาอังกฤษ',
  `risk_color` varchar(20) DEFAULT NULL COMMENT 'รหัสสี hex',
  `assessed_at` timestamp NULL DEFAULT NULL COMMENT 'เวลาที่ประเมินผล',

  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`id`),
  KEY `idx_location_type` (`location_type`),
  KEY `idx_province_id` (`ProvinceID`),
  KEY `idx_region_id` (`RegionID`),
  KEY `idx_country_id` (`countryID`),
  KEY `idx_status_code` (`status_code`),
  KEY `idx_submitted_at` (`submitted_at`),
  KEY `idx_age` (`age`),
  KEY `idx_sex` (`sex`),

  -- Foreign Keys (SET NULL เพื่อให้ลบ master ได้โดยไม่ทำลายข้อมูลผู้กรอก)
  CONSTRAINT `fk_nonlab_province` FOREIGN KEY (`ProvinceID`) REFERENCES `province` (`ProvinceID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_nonlab_region` FOREIGN KEY (`RegionID`) REFERENCES `region` (`RegionID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_nonlab_country` FOREIGN KEY (`countryID`) REFERENCES `country` (`countryID`) ON DELETE SET NULL ON UPDATE CASCADE,

  -- Constraints
  CONSTRAINT `chk_nonlab_age` CHECK (`age` >= 39),
  CONSTRAINT `chk_nonlab_location` CHECK (
    (`location_type` = 'province' AND `ProvinceID` IS NOT NULL AND `countryID` IS NULL)
    OR
    (`location_type` = 'country' AND `countryID` IS NOT NULL AND `ProvinceID` IS NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Sample data (กรณีจังหวัดไทย)
INSERT INTO `form_nonlab` 
  (`name`, `lastname`, `sex`, `age`, `smoking_status`, `sbp1`, `sbp2`, `sbptotal`, `weight`, `height`,
   `location_type`, `ProvinceID`, `ProvinceName`, `RegionID`, `province`,
   `risk_percent`, `status_code`, `status_label_th`, `status_label_en`, `risk_color`, `assessed_at`,
   `submitted_at`)
VALUES
  (NULL, NULL, 0, 60, 0, 140, 152, 146, 65, 160,
   'province', '27', 'สระแก้ว', '5', 'สระแก้ว',
   8.75, 'low', 'เสี่ยงน้อย', 'Low', '#65a30d', '2026-05-12 08:27:00',
   '2026-05-12 08:27:00'),
  (NULL, NULL, 1, 55, 1, 145, 150, 148, 70, 170,
   'province', '10', 'กรุงเทพมหานคร', '1', 'กรุงเทพมหานคร',
   18.50, 'moderate', 'เสี่ยงปานกลาง', 'Moderate', '#d97706', '2026-05-12 09:15:00',
   '2026-05-12 09:15:00');

-- Sample data (กรณีประเทศต่างประเทศ)
INSERT INTO `form_nonlab` 
  (`name`, `lastname`, `sex`, `age`, `smoking_status`, `sbp1`, `sbp2`, `sbptotal`, `weight`, `height`,
   `location_type`, `countryID`, `countryName`, `province`,
   `risk_percent`, `status_code`, `status_label_th`, `status_label_en`, `risk_color`, `assessed_at`,
   `submitted_at`)
VALUES
  ('John', 'Doe', 1, 50, 0, 135, 138, 137, 75, 175,
   'country', '702', 'Singapore', 'Singapore',
   6.25, 'low', 'เสี่ยงน้อย', 'Low', '#65a30d', '2026-05-12 10:00:00',
   '2026-05-12 10:00:00');

-- ============================================================
-- Table structure for table `form_lab`
-- การประเมินความเสี่ยงแบบใช้ผลตรวจเลือด
-- ============================================================
CREATE TABLE `form_lab` (
  `id` int(11) NOT NULL AUTO_INCREMENT,

  -- ข้อมูลส่วนบุคคล
  `name` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `sex` tinyint(1) NOT NULL COMMENT '0=หญิง, 1=ชาย',
  `age` int(11) NOT NULL,
  `smoking_status` tinyint(1) NOT NULL COMMENT '0=ไม่สูบ, 1=สูบ',
  `diabetes_status` tinyint(1) NOT NULL COMMENT '0=ไม่เป็น, 1=เป็น',

  -- ตัวชี้วัดสุขภาพ
  `sbp1` int(11) NOT NULL COMMENT 'ความดันค่าบนครั้งที่ 1 (mmHg)',
  `sbp2` int(11) NOT NULL COMMENT 'ความดันค่าบนครั้งที่ 2 (mmHg)',
  `sbptotal` int(11) NOT NULL COMMENT 'ค่าเฉลี่ย SBP',
  `total_cholesterol` int(11) NOT NULL COMMENT 'ระดับคอลเลสเตอรอลรวม (mg/dL)',

  -- ที่อยู่
  `location_type` enum('province','country') NOT NULL DEFAULT 'province' COMMENT 'province=ไทย, country=ต่างประเทศ',
  `ProvinceID` varchar(50) DEFAULT NULL COMMENT 'FK → province.ProvinceID',
  `ProvinceName` varchar(255) DEFAULT NULL COMMENT 'snapshot ชื่อจังหวัด',
  `RegionID` varchar(50) DEFAULT NULL COMMENT 'FK → region.RegionID',
  `countryID` varchar(10) DEFAULT NULL COMMENT 'FK → country.countryID',
  `countryName` varchar(100) DEFAULT NULL COMMENT 'snapshot ชื่อประเทศ',
  `province` varchar(100) NOT NULL COMMENT 'ค่ารวม (backward compat)',

  -- ผลการประเมิน
  `risk_percent` decimal(5,2) DEFAULT NULL COMMENT 'ค่าความเสี่ยง %',
  `status_code` varchar(20) DEFAULT NULL COMMENT 'very_low / low / moderate / high / very_high',
  `status_label_th` varchar(50) DEFAULT NULL,
  `status_label_en` varchar(50) DEFAULT NULL,
  `risk_color` varchar(20) DEFAULT NULL,
  `assessed_at` timestamp NULL DEFAULT NULL,

  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`id`),
  KEY `idx_location_type` (`location_type`),
  KEY `idx_province_id` (`ProvinceID`),
  KEY `idx_region_id` (`RegionID`),
  KEY `idx_country_id` (`countryID`),
  KEY `idx_status_code` (`status_code`),
  KEY `idx_submitted_at` (`submitted_at`),
  KEY `idx_age` (`age`),
  KEY `idx_sex` (`sex`),

  -- Foreign Keys
  CONSTRAINT `fk_lab_province` FOREIGN KEY (`ProvinceID`) REFERENCES `province` (`ProvinceID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_lab_region` FOREIGN KEY (`RegionID`) REFERENCES `region` (`RegionID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_lab_country` FOREIGN KEY (`countryID`) REFERENCES `country` (`countryID`) ON DELETE SET NULL ON UPDATE CASCADE,

  -- Constraints
  CONSTRAINT `chk_lab_age` CHECK (`age` >= 39),
  CONSTRAINT `chk_lab_location` CHECK (
    (`location_type` = 'province' AND `ProvinceID` IS NOT NULL AND `countryID` IS NULL)
    OR
    (`location_type` = 'country' AND `countryID` IS NOT NULL AND `ProvinceID` IS NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Sample data
INSERT INTO `form_lab` 
  (`name`, `lastname`, `sex`, `age`, `smoking_status`, `diabetes_status`,
   `sbp1`, `sbp2`, `sbptotal`, `total_cholesterol`,
   `location_type`, `ProvinceID`, `ProvinceName`, `RegionID`, `province`,
   `risk_percent`, `status_code`, `status_label_th`, `status_label_en`, `risk_color`, `assessed_at`,
   `submitted_at`)
VALUES
  (NULL, NULL, 1, 54, 1, 1, 154, 180, 167, 170,
   'province', '18', 'ชัยนาท', '1', 'ชัยนาท',
   25.50, 'high', 'เสี่ยงสูง', 'High', '#c2410c', '2026-03-12 04:31:55',
   '2026-03-12 04:31:55'),
  (NULL, NULL, 0, 45, 0, 0, 130, 132, 131, 180,
   'province', '50', 'เชียงใหม่', '2', 'เชียงใหม่',
   3.25, 'very_low', 'เสี่ยงน้อยมาก', 'Very Low', '#15803d', '2026-04-15 10:20:00',
   '2026-04-15 10:20:00');

-- ============================================================
-- COMMIT
-- ============================================================
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- ============================================================
-- END OF FILE
-- ============================================================
