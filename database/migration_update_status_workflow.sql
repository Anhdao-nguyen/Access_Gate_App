/*
  Migration: Update visitor_requests status workflow
  Date: 2026-02-05

  New Status Flow:
  1. submitted - Just created (was 'pending')
  2. manager_approved - Manager approved
  3. plant_manager_approved - Plant Manager approved
  4. ready - Ready for check-in (shows on Checkin page)
  5. checked_in - Guard confirmed check-in
  6. checked_out - Guard confirmed check-out (was 'completed')
  7. rejected - Rejected by manager/plant manager
  8. cancelled - Cancelled by requester

  Instructions:
  1. Open MySQL Workbench
  2. Connect to your database
  3. Select the access_gate_app database
  4. Run this migration script

  IMPORTANT: Backup your database before running!
*/

USE access_gate_app;

-- Step 1: Add new columns for plant manager approval
ALTER TABLE visitor_requests
ADD COLUMN IF NOT EXISTS plant_manager_approver_id INT COMMENT 'Plant Manager được chỉ định duyệt' AFTER manager_approver_id,
ADD COLUMN IF NOT EXISTS plant_manager_approved_by INT COMMENT 'Plant Manager thực tế đã duyệt' AFTER approved_by;

-- Add foreign keys for plant manager
ALTER TABLE visitor_requests
ADD CONSTRAINT fk_plant_manager_approver
    FOREIGN KEY (plant_manager_approver_id) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_plant_manager_approved
    FOREIGN KEY (plant_manager_approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Step 2: Update existing 'pending' to 'submitted'
UPDATE visitor_requests
SET status = 'submitted'
WHERE status = 'pending';

-- Step 3: Update existing 'completed' to 'checked_out'
UPDATE visitor_requests
SET status = 'checked_out'
WHERE status = 'completed';

-- Step 4: Modify ENUM to include new statuses
ALTER TABLE visitor_requests
MODIFY COLUMN status ENUM(
    'submitted',
    'manager_approved',
    'plant_manager_approved',
    'ready',
    'checked_in',
    'checked_out',
    'rejected',
    'cancelled'
) DEFAULT 'submitted';

-- Verify the changes
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'access_gate_app'
  AND TABLE_NAME = 'visitor_requests'
  AND COLUMN_NAME = 'status';

-- Show status distribution
SELECT status, COUNT(*) as count
FROM visitor_requests
GROUP BY status;
