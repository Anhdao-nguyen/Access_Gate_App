/**
 * Visitor Repository
 * Handles data access for Visitor Requests using MySQL
 */

const { pool } = require('../../config/database');

class VisitorRepository {
    async findAll(filters = {}) {
        let sql = `
            SELECT vr.*, f.name as factory_name, f.code as factory_code
            FROM visitor_requests vr
            LEFT JOIN factories f ON vr.factory_id = f.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.factoryId) {
            // Handle both numeric ID and string Code
            if (!isNaN(filters.factoryId)) {
                sql += ' AND vr.factory_id = ?';
            } else {
                sql += ' AND f.code = ?';
            }
            params.push(filters.factoryId);
        }
        if (filters.status) {
            sql += ' AND vr.status = ?';
            params.push(filters.status);
        }
        // Support multiple statuses (for guard role - bao_ve)
        if (filters.allowedStatuses && Array.isArray(filters.allowedStatuses)) {
            sql += ` AND vr.status IN (${filters.allowedStatuses.map(() => '?').join(',')})`;
            params.push(...filters.allowedStatuses);
        }
        if (filters.type) {
            sql += ' AND vr.type = ?';
            params.push(filters.type);
        }
        if (filters.date) {
            sql += ' AND vr.scheduled_date = ?';
            params.push(filters.date);
        }
        if (filters.requestedBy) {
            sql += ' AND vr.requested_by = ?';
            params.push(filters.requestedBy);
        }
        // Support multiple requestedBy IDs (for manager role)
        if (filters.requestedByIds && Array.isArray(filters.requestedByIds)) {
            sql += ` AND vr.requested_by IN (${filters.requestedByIds.map(() => '?').join(',')})`;
            params.push(...filters.requestedByIds);
        }
        if (filters.managerApproverId) {
            sql += ' AND vr.manager_approver_id = ?';
            params.push(filters.managerApproverId);
        }

        sql += ' ORDER BY vr.created_at DESC';

        const [rows] = await pool.execute(sql, params);

        // For each request, fetch its visitors
        const results = [];
        for (const row of rows) {
            const visitors = await this.getVisitorsByRequestId(row.id);
            results.push(this.mapToModel(row, visitors));
        }

        return results;
    }

    async findById(id) {
        // id can be INT primary key or VARCHAR request_code
        let sql = `
            SELECT vr.*, f.name as factory_name, f.code as factory_code
            FROM visitor_requests vr
            LEFT JOIN factories f ON vr.factory_id = f.id
            WHERE vr.id = ? OR vr.request_code = ?
        `;

        const [rows] = await pool.execute(sql, [id, id]);

        if (rows.length === 0) return null;

        const row = rows[0];
        const visitors = await this.getVisitorsByRequestId(row.id);

        return this.mapToModel(row, visitors);
    }

    async getVisitorsByRequestId(requestId) {
        const [rows] = await pool.execute(`
            SELECT v.*, rv.ppe_hairnet, rv.ppe_safety_shoes, rv.shoe_size
            FROM visitors v
            JOIN request_visitors rv ON v.id = rv.visitor_id
            WHERE rv.request_id = ?
        `, [requestId]);

        // Get ALL check-in/out logs for this request in one query
        const [allLogs] = await pool.execute(`
            SELECT visitor_id, action, timestamp
            FROM access_logs
            WHERE request_id = ? AND action IN ('checkin', 'checkout')
            ORDER BY timestamp DESC
        `, [requestId]);

        // Build a map of latest logs per visitor
        const logMap = {};
        for (const log of allLogs) {
            if (!logMap[log.visitor_id]) {
                logMap[log.visitor_id] = { checkin: null, checkout: null };
            }

            // Get the latest log for each action type
            if (log.action === 'checkin' && !logMap[log.visitor_id].checkin) {
                logMap[log.visitor_id].checkin = log.timestamp;
            }
            if (log.action === 'checkout' && !logMap[log.visitor_id].checkout) {
                logMap[log.visitor_id].checkout = log.timestamp;
            }
        }

        // Build visitor objects
        const visitors = rows.map(v => {
            const logs = logMap[v.id] || { checkin: null, checkout: null };
            const checkedIn = logs.checkin !== null && logs.checkout === null;

            return {
                id: v.id,
                db_id: v.id,
                fullName: v.full_name,
                idCard: v.id_card_number,
                phone: v.phone_number,
                company: v.company,
                photo: v.photo_url,
                email: null,
                ppeHairnet: Boolean(v.ppe_hairnet),
                ppeSafetyShoes: Boolean(v.ppe_safety_shoes),
                shoeSize: v.shoe_size,
                requirePPE: {
                    hairnet: Boolean(v.ppe_hairnet),
                    safetyShoes: Boolean(v.ppe_safety_shoes),
                    shoeSize: v.shoe_size
                },
                checkedIn: checkedIn,
                checkInTime: logs.checkin,
                checkOutTime: logs.checkout
            };
        });

        return visitors;
    }

    async create(data) {
        // Transition from Service ID generation to DB Auto-increment/Request Code
        const [result] = await pool.execute(
            `INSERT INTO visitor_requests
            (request_code, type, status, factory_id, purpose, access_area, scheduled_date, scheduled_time,
            host_name, host_department, host_phone, manager_name, manager_email,
            vehicle_plate, notes, requested_by, manager_approver_id, plant_manager_approver_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.id, // Using the ID generated by service for now to keep it consistent
                data.type || 'visitor',
                data.status || 'submitted',
                data.factoryId || 1, // Default factory if not provided
                data.purpose || null,
                data.accessArea || null,
                data.scheduledDate || null,
                data.scheduledTime || null,
                data.host?.name || data.hostName || null,
                data.host?.department || data.hostDepartment || null,
                data.host?.phone || data.hostPhone || null,
                data.host?.managerName || null,
                data.host?.managerEmail || null,
                data.vehiclePlate || null,
                data.notes || null,
                data.requestedBy || 1, // Default user if not provided
                data.managerApproverId || null,
                data.plantManagerApproverId || null
            ]
        );

        const requestId = result.insertId;

        // Create visitors and links
        if (data.visitors && data.visitors.length > 0) {
            for (const v of data.visitors) {
                // Check if visitor exists by ID Card
                let visitorId;
                const [existing] = await pool.execute('SELECT id FROM visitors WHERE id_card_number = ?', [v.idCard]);

                if (existing.length > 0) {
                    visitorId = existing[0].id;
                } else {
                    const [vResult] = await pool.execute(
                        'INSERT INTO visitors (full_name, id_card_number, phone_number, company) VALUES (?, ?, ?, ?)',
                        [v.fullName, v.idCard, v.phone, v.company]
                    );
                    visitorId = vResult.insertId;
                }

                // Insert request_visitors with PPE data
                await pool.execute(
                    'INSERT INTO request_visitors (request_id, visitor_id, ppe_hairnet, ppe_safety_shoes, shoe_size) VALUES (?, ?, ?, ?, ?)',
                    [requestId, visitorId, v.ppeHairnet || false, v.ppeSafetyShoes || false, v.shoeSize || null]
                );
            }
        }

        return await this.findById(requestId);
    }

    async update(id, data) {
        const fields = [];
        const values = [];

        if (data.status) { fields.push('status = ?'); values.push(data.status); }
        if (data.purpose) { fields.push('purpose = ?'); values.push(data.purpose); }
        if (data.notes) { fields.push('notes = ?'); values.push(data.notes); }
        if (data.approvedBy) { fields.push('approved_by = ?'); values.push(data.approvedBy); }
        if (data.rejectedBy) { fields.push('rejected_by = ?'); values.push(data.rejectedBy); }
        if (data.managerApproverId) { fields.push('manager_approver_id = ?'); values.push(data.managerApproverId); }
        if (data.rejectionReason) { fields.push('rejection_reason = ?'); values.push(data.rejectionReason); }

        if (fields.length === 0) return await this.findById(id);

        values.push(id);
        values.push(id); // for request_code

        await pool.execute(
            `UPDATE visitor_requests SET ${fields.join(', ')} WHERE id = ? OR request_code = ?`,
            values
        );

        return await this.findById(id);
    }

    async replace(updatedVisitor) {
        // For compatibility with Service Layer
        return await this.update(updatedVisitor.id, updatedVisitor);
    }

    async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM visitor_requests WHERE id = ? OR request_code = ?',
            [id, id]
        );
        return result.affectedRows > 0;
    }

    async count() {
        const [rows] = await pool.execute('SELECT COUNT(*) as count FROM visitor_requests');
        return rows[0].count;
    }

    mapToModel(row, visitors) {
        return {
            id: row.request_code || row.id.toString(),
            db_id: row.id,
            type: row.type,
            status: row.status,
            factoryId: row.factory_code || row.factory_id.toString(),
            factoryName: row.factory_name,
            purpose: row.purpose,
            accessArea: row.access_area,
            scheduledDate: row.scheduled_date instanceof Date ? row.scheduled_date.toISOString().split('T')[0] : row.scheduled_date,
            scheduledTime: row.scheduled_time,
            visitors: visitors,
            host: {
                name: row.host_name,
                department: row.host_department,
                phone: row.host_phone,
                managerName: row.manager_name,
                managerEmail: row.manager_email
            },
            vehiclePlate: row.vehicle_plate,
            notes: row.notes,
            requestedBy: row.requested_by,
            managerApproverId: row.manager_approver_id,
            approvedBy: row.approved_by,
            plantManagerApproverId: row.plant_manager_approver_id,
            plantManagerApprovedBy: row.plant_manager_approved_by,
            rejectedBy: row.rejected_by,
            rejectionReason: row.rejection_reason,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}

module.exports = new VisitorRepository();

