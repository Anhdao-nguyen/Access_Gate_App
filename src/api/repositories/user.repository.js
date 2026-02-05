/**
 * User Repository
 * Handles data access for Users using MySQL
 */

const { pool } = require('../../config/database');

class UserRepository {
    async findAll(filters = {}) {
        let sql = 'SELECT * FROM users WHERE is_active = 1';
        const params = [];

        if (filters.role) {
            sql += ' AND role = ?';
            params.push(filters.role);
        }

        if (filters.factoryId) {
            sql += ' AND factory_id = ?';
            params.push(filters.factoryId);
        }

        if (filters.managerId) {
            sql += ' AND manager_id = ?';
            params.push(filters.managerId);
        }

        const [rows] = await pool.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    async findByUsername(username) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0] || null;
    }

    async authenticate(username, password) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ? AND password = ? AND is_active = 1',
            [username, password]
        );

        if (rows.length > 0) {
            const user = rows[0];
            // Return user without password
            const { password: _, ...safeUser } = user;
            return safeUser;
        }
        return null;
    }

    async create(userData) {
        const [result] = await pool.execute(
            'INSERT INTO users (username, password, full_name, email, role, factory_id, position, avatar, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                userData.username,
                userData.password,
                userData.fullName,
                userData.email || null,
                userData.role || 'user',
                userData.factoryId || null,
                userData.position || null,
                userData.avatar || null,
                userData.managerId || null
            ]
        );
        return await this.findById(result.insertId);
    }

    async update(id, userData) {
        const fields = [];
        const values = [];

        if (userData.fullName !== undefined) {
            fields.push('full_name = ?');
            values.push(userData.fullName);
        }
        if (userData.email !== undefined) {
            fields.push('email = ?');
            values.push(userData.email);
        }
        if (userData.role !== undefined) {
            fields.push('role = ?');
            values.push(userData.role);
        }
        if (userData.factoryId !== undefined) {
            fields.push('factory_id = ?');
            values.push(userData.factoryId);
        }
        if (userData.position !== undefined) {
            fields.push('position = ?');
            values.push(userData.position);
        }
        if (userData.avatar !== undefined) {
            fields.push('avatar = ?');
            values.push(userData.avatar);
        }
        if (userData.managerId !== undefined) {
            fields.push('manager_id = ?');
            values.push(userData.managerId);
        }
        if (userData.isActive !== undefined) {
            fields.push('is_active = ?');
            values.push(userData.isActive);
        }

        if (fields.length === 0) return await this.findById(id);

        values.push(id);
        await pool.execute(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return await this.findById(id);
    }

    async delete(id) {
        // Soft delete
        await pool.execute(
            'UPDATE users SET is_active = 0 WHERE id = ?',
            [id]
        );
        return true;
    }
}

module.exports = new UserRepository();
