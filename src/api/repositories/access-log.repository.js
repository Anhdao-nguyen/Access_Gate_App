/**
 * Access Log Repository
 * Handles data access for Access Logs using MySQL
 */

const { pool } = require('../../config/database');

class AccessLogRepository {
    async findAll(filters = {}) {
        let sql = `
            SELECT al.* 
            FROM access_logs al
            LEFT JOIN gates g ON al.gate_id = g.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.factoryId) {
            sql += ' AND g.factory_id = ?';
            params.push(filters.factoryId);
        }
        if (filters.gateId) {
            sql += ' AND al.gate_id = ?';
            params.push(filters.gateId);
        }
        if (filters.action) {
            sql += ' AND al.action = ?';
            params.push(filters.action);
        }
        if (filters.date) {
            sql += ' AND DATE(al.timestamp) = ?';
            params.push(filters.date);
        }

        sql += ' ORDER BY al.timestamp DESC';

        const [rows] = await pool.execute(sql, params);
        return rows;
    }

    async create(logData) {
        const [result] = await pool.execute(
            'INSERT INTO access_logs (request_id, visitor_id, gate_id, guard_id, action, timestamp, vehicle_plate, image_snapshot, notes, visitor_name, gate_name, guard_name, company) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                logData.requestId || null,
                logData.visitorId,
                logData.gateId || null,
                logData.guardId || null,
                logData.action,
                logData.timestamp || new Date(),
                logData.vehiclePlate || null,
                logData.photo || null,
                logData.notes || null,
                logData.visitorName,
                logData.gateName,
                logData.guardName,
                logData.company
            ]
        );
        return { id: result.insertId, ...logData };
    }

    async findByFactoryId(factoryId, limit = 10) {
        const [rows] = await pool.execute(
            `SELECT al.* 
             FROM access_logs al
             LEFT JOIN gates g ON al.gate_id = g.id
             WHERE g.factory_id = ? 
             ORDER BY al.timestamp DESC LIMIT ?`,
            [Number(factoryId), Number(limit)]
        );
        return rows;
    }
}

module.exports = new AccessLogRepository();


