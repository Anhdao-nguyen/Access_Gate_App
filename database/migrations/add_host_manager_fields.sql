-- Add Host's Manager information fields to visitor_requests table
-- Date: 2026-02-04

USE access_gate_app;

ALTER TABLE visitor_requests
ADD COLUMN host_manager_name VARCHAR(255) COMMENT 'Tên Manager của Host (người tiếp đón)' AFTER host_phone,
ADD COLUMN host_manager_email VARCHAR(255) COMMENT 'Email Manager của Host' AFTER host_manager_name;

-- Verify changes
DESCRIBE visitor_requests;
