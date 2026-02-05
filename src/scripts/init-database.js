/**
 * Database Initialization Script
 * Runs the SQL schema file to create tables and seed initial data
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDatabase() {
    console.log('🔄 Starting database initialization...\n');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, '../../database/init_db.sql');

    if (!fs.existsSync(sqlFilePath)) {
        console.error('❌ SQL file not found:', sqlFilePath);
        process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL statements (basic split by semicolon)
    const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

    try {
        // Create connection (without database specified initially)
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 60000,
            multipleStatements: true
        });

        console.log('✓ Connected to MySQL server');

        // Execute each statement
        let successCount = 0;
        let errorCount = 0;

        for (const statement of statements) {
            try {
                await connection.query(statement);
                successCount++;

                // Log significant operations
                if (statement.includes('CREATE DATABASE')) {
                    console.log('✓ Database created/verified');
                } else if (statement.includes('CREATE TABLE')) {
                    const match = statement.match(/CREATE TABLE.*?(\w+)\s*\(/i);
                    if (match) console.log(`✓ Table created: ${match[1]}`);
                } else if (statement.includes('INSERT INTO')) {
                    const match = statement.match(/INSERT INTO\s+(\w+)/i);
                    if (match) console.log(`✓ Data inserted into: ${match[1]}`);
                }
            } catch (error) {
                // Ignore "already exists" errors
                if (!error.message.includes('already exists')) {
                    console.error('❌ Error executing statement:', error.message);
                    errorCount++;
                }
            }
        }

        await connection.end();

        console.log('\n================================================');
        console.log(`✅ Database initialization completed!`);
        console.log(`   - Successful statements: ${successCount}`);
        if (errorCount > 0) {
            console.log(`   - Errors (non-critical): ${errorCount}`);
        }
        console.log('================================================\n');

    } catch (error) {
        console.error('\n❌ Database initialization failed:', error.message);
        console.error('\nPlease check your .env configuration:');
        console.error(`   DB_HOST: ${process.env.DB_HOST}`);
        console.error(`   DB_PORT: ${process.env.DB_PORT}`);
        console.error(`   DB_USER: ${process.env.DB_USER}`);
        console.error(`   DB_NAME: ${process.env.DB_NAME}`);
        process.exit(1);
    }
}

// Run initialization
initDatabase();
