/**
 * Factory Repository
 * Handles data access for Factories and Gates using MySQL
 */

const { pool } = require('../../config/database');

class FactoryRepository {
    async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM factories WHERE is_active = 1'
        );
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM factories WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    async findByCode(code) {
        const [rows] = await pool.execute(
            'SELECT * FROM factories WHERE code = ?',
            [code]
        );
        return rows[0] || null;
    }

    async getGates(factoryId) {
        const [rows] = await pool.execute(
            'SELECT * FROM gates WHERE factory_id = ? AND is_active = 1',
            [factoryId]
        );
        return rows;
    }

    async getGate(factoryId, gateId) {
        const [rows] = await pool.execute(
            'SELECT * FROM gates WHERE id = ? AND factory_id = ?',
            [gateId, factoryId]
        );
        return rows[0] || null;
    }
}

module.exports = new FactoryRepository();

