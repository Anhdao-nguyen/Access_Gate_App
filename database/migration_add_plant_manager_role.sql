-- Migration: Add plant_manager and manager roles to users table
-- Date: 2026-02-05
-- Description: Updates the role ENUM to include 'plant_manager' and 'manager' roles

USE access_gate_app;

-- Step 1: Add new roles to the ENUM
ALTER TABLE users 
MODIFY COLUMN role ENUM('admin', 'hse', 'receptionist', 'plant_manager', 'manager', 'guard', 'user') DEFAULT 'user';

-- Step 2: Insert sample plant_manager user (password: 123456)
INSERT INTO users (username, password, full_name, role, factory_id, position, manager_id) 
VALUES ('plant_manager', '123456', 'Plant Manager User', 'plant_manager', 1, 'Plant Manager', NULL)
ON DUPLICATE KEY UPDATE 
    role = 'plant_manager',
    full_name = 'Plant Manager User',
    position = 'Plant Manager';

-- Step 3: Insert sample manager user (password: 123456)
INSERT INTO users (username, password, full_name, role, factory_id, position, manager_id) 
VALUES ('manager', '123456', 'Manager User', 'manager', 1, 'Manager', NULL)
ON DUPLICATE KEY UPDATE 
    role = 'manager',
    full_name = 'Manager User',
    position = 'Manager';

-- Verify the changes
SELECT id, username, full_name, role, position FROM users WHERE role IN ('plant_manager', 'manager');
