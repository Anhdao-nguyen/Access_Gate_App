/*
  Migration: Add host_manager_name and host_manager_email fields
  Date: 2026-02-04

  Instructions:
  1. Open MySQL Workbench
  2. Connect to your database
  3. Select the access_gate_app database
  4. Run this migration script
*/

USE access_gate_app;

-- Add host_manager_name column if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'visitor_requests';
SET @columnname = 'host_manager_name';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(255) COMMENT ''Tên Manager của Host'' AFTER host_phone')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add host_manager_email column if it doesn't exist
SET @columnname = 'host_manager_email';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(255) COMMENT ''Email Manager của Host'' AFTER host_manager_name')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verify the columns were added
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'access_gate_app'
  AND TABLE_NAME = 'visitor_requests'
  AND COLUMN_NAME IN ('host_manager_name', 'host_manager_email');
