-- Fix Database Schema - Add Missing Columns
-- Run this to fix the schema mismatch errors

-- 1. Add PPE columns to request_visitors table
ALTER TABLE request_visitors
ADD COLUMN IF NOT EXISTS ppe_hairnet BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ppe_safety_shoes BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS shoe_size VARCHAR(10) NULL;

-- 2. Add plant_manager_approver_id to visitor_requests table
ALTER TABLE visitor_requests
ADD COLUMN IF NOT EXISTS plant_manager_approver_id INT NULL,
ADD COLUMN IF NOT EXISTS plant_manager_approved_by INT NULL;

-- 3. Verify the changes
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'request_visitors'
AND TABLE_SCHEMA = DATABASE();

SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'visitor_requests'
AND TABLE_SCHEMA = DATABASE();
