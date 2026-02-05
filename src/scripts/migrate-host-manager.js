/**
 * Migration: Add host_manager_name and host_manager_email columns
 */

require('dotenv').config();
const { pool } = require('../config/database');

async function migrate() {
    console.log('Starting migration: Add host manager fields...');

    try {
        // Check if columns already exist
        const [columns] = await pool.execute(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'visitor_requests'
            AND COLUMN_NAME IN ('host_manager_name', 'host_manager_email')
        `, [process.env.DB_NAME]);

        if (columns.length > 0) {
            console.log('⚠ Columns already exist. Skipping migration.');
            process.exit(0);
        }

        // Add columns
        await pool.execute(`
            ALTER TABLE visitor_requests
            ADD COLUMN host_manager_name VARCHAR(255) COMMENT 'Tên Manager của Host' AFTER host_phone,
            ADD COLUMN host_manager_email VARCHAR(255) COMMENT 'Email Manager của Host' AFTER host_manager_name
        `);

        console.log('✓ Migration completed successfully!');
        console.log('  - Added column: host_manager_name');
        console.log('  - Added column: host_manager_email');

        process.exit(0);
    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
