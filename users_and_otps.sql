-- ============================================================================
-- SQL Schema & Data: Table `users` & Table `otps`
-- Dealer Resmi: PT Sun Star Prima Motor Margahayu (Sunny Portal)
-- ============================================================================

-- 1. Table `users`
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nik` VARCHAR(50) NULL UNIQUE COMMENT 'Nomor Induk Karyawan resmi',
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NULL UNIQUE COMMENT 'Nomor Telepon / WhatsApp',
  `password` VARCHAR(255) NOT NULL,
  `position` VARCHAR(100) NOT NULL DEFAULT 'Staf Operasional' COMMENT 'Jabatan resmi',
  `role` ENUM('superadmin', 'admin', 'user') NOT NULL DEFAULT 'user' COMMENT 'superadmin=developer, admin=manajemen dealer, user=staf/sales',
  `department` VARCHAR(100) NULL COMMENT 'Divisi / Departemen kerja',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `avatar` TEXT NULL,
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `phone_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `last_login_ip` VARCHAR(45) NULL DEFAULT NULL,
  `remember_token` VARCHAR(100) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table `otps` (Untuk Reset Password / Lupa Sandi / 2FA)
CREATE TABLE IF NOT EXISTS `otps` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `identifier` VARCHAR(255) NOT NULL COMMENT 'Email atau Nomor WhatsApp penerima OTP',
  `otp_code` VARCHAR(10) NOT NULL COMMENT '6-digit kode verifikasi OTP',
  `type` VARCHAR(50) NOT NULL DEFAULT 'reset_password' COMMENT 'reset_password, login_2fa, verification',
  `expires_at` TIMESTAMP NOT NULL,
  `is_used` TINYINT(1) NOT NULL DEFAULT 0,
  `used_at` TIMESTAMP NULL DEFAULT NULL,
  `attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `ip_address` VARCHAR(45) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_otps_lookup` (`identifier`, `otp_code`, `is_used`),
  CONSTRAINT `fk_otps_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Data Default Users
INSERT INTO `users` (`id`, `nik`, `name`, `email`, `phone`, `password`, `position`, `role`, `department`, `status`, `avatar`, `email_verified_at`, `phone_verified_at`)
VALUES
(1, 'SNY-DEV-001', 'Dev Antigravity', 'dev@sunmargahayu.co.id', '081289001234', '$2y$12$eImiTXuWVxfM37uY4JANjOL.oTY1uv1PTx.24MyMxfa5vGk.5D/D.', 'Lead System Architect & Developer', 'superadmin', 'Information Technology', 'active', 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg', NOW(), NOW()),
(2, 'SNY-ADM-001', 'Hendra Gunawan', 'admin@sunmargahayu.co.id', '081298765432', '$2y$12$eImiTXuWVxfM37uY4JANjOL.oTY1uv1PTx.24MyMxfa5vGk.5D/D.', 'Operational Branch Manager', 'admin', 'Executive Leadership', 'active', 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg', NOW(), NOW()),
(3, 'SNY-SLS-0412', 'Agnes Maharani', 'agnes@sunmargahayu.co.id', '081311223344', '$2y$12$eImiTXuWVxfM37uY4JANjOL.oTY1uv1PTx.24MyMxfa5vGk.5D/D.', 'Senior Sales Executive', 'user', 'Sales & Marketing', 'active', 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg', NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `position`=VALUES(`position`), `role`=VALUES(`role`);
