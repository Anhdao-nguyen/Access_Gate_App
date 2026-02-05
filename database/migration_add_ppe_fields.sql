/*
  Migration: Add PPE (Personal Protective Equipment) Fields
  Date: 2026-02-05
  Description: Adds PPE requirement fields to request_visitors junction table

  Instructions:
  1. Open MySQL Workbench
  2. Connect to your database
  3. Run this migration script
*/

USE access_gate_app;

-- Add PPE fields to request_visitors table
ALTER TABLE request_visitors
ADD COLUMN ppe_hairnet BOOLEAN DEFAULT FALSE COMMENT 'Requires hairnet',
ADD COLUMN ppe_safety_shoes BOOLEAN DEFAULT FALSE COMMENT 'Requires safety shoes',
ADD COLUMN shoe_size VARCHAR(10) COMMENT 'Shoe size if safety shoes required';

-- Update existing data (optional - sets default values for existing records)
UPDATE request_visitors
SET ppe_hairnet = FALSE, ppe_safety_shoes = FALSE
WHERE ppe_hairnet IS NULL OR ppe_safety_shoes IS NULL;
