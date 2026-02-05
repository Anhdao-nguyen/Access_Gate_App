/**
 * Visitor Service
 * Business logic for Visitor Request management using MySQL
 */

const visitorRepository = require('../repositories/visitor.repository');

class VisitorService {
    async findAll(filters = {}) {
        let result = await visitorRepository.findAll(filters);

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(v =>
                v.id.toLowerCase().includes(searchLower) ||
                v.visitors.some(vis =>
                    vis.fullName.toLowerCase().includes(searchLower) ||
                    vis.company.toLowerCase().includes(searchLower) ||
                    (vis.phone && vis.phone.includes(searchLower)) ||
                    (vis.idCard && vis.idCard.includes(searchLower))
                ) ||
                (v.vehiclePlate && v.vehiclePlate.toLowerCase().includes(searchLower))
            );
        }

        return result;
    }

    async findById(id) {
        return await visitorRepository.findById(id);
    }

    async create(data) {
        // Business Logic: Generate IDs
        const year = new Date().getFullYear();
        const count = await visitorRepository.count() + 1;
        const requestId = `VR-${year}-${String(count).padStart(5, '0')}`;

        // Prepare data for repository
        const requestData = {
            ...data,
            id: requestId
        };

        return await visitorRepository.create(requestData);
    }

    async update(id, data) {
        return await visitorRepository.update(id, data);
    }

    async approve(id, approvedBy) {
        const visitor = await visitorRepository.findById(id);
        if (!visitor) return null;

        // Manager approval: submitted -> manager_approved
        if (visitor.status === 'submitted') {
            const updateData = {
                status: 'manager_approved',
                approvedBy: approvedBy,
                updatedAt: new Date().toISOString()
            };
            return await visitorRepository.update(id, updateData);
        }

        return null;
    }

    async plantManagerApprove(id, approvedBy) {
        const visitor = await visitorRepository.findById(id);
        if (!visitor) return null;

        // Plant Manager approval: manager_approved -> ready
        if (visitor.status === 'manager_approved') {
            const updateData = {
                status: 'ready',
                plantManagerApprovedBy: approvedBy,
                updatedAt: new Date().toISOString()
            };
            return await visitorRepository.update(id, updateData);
        }

        return null;
    }

    async checkIn(id, guardId) {
        const visitor = await visitorRepository.findById(id);
        if (!visitor) return null;

        // Check-in: ready -> checked_in
        if (visitor.status === 'ready') {
            const updateData = {
                status: 'checked_in',
                updatedAt: new Date().toISOString()
            };
            return await visitorRepository.update(id, updateData);
        }

        return null;
    }

    async checkOut(id, guardId) {
        const visitor = await visitorRepository.findById(id);
        if (!visitor) return null;

        // Check-out: checked_in -> checked_out
        if (visitor.status === 'checked_in') {
            const updateData = {
                status: 'checked_out',
                updatedAt: new Date().toISOString()
            };
            return await visitorRepository.update(id, updateData);
        }

        return null;
    }

    async reject(id, rejectedBy, reason) {
        const visitor = await visitorRepository.findById(id);
        if (!visitor) return null;

        // Can reject if submitted or manager_approved
        if (visitor.status === 'submitted' || visitor.status === 'manager_approved') {
            const updateData = {
                status: 'rejected',
                rejectedBy: rejectedBy,
                rejectionReason: reason,
                updatedAt: new Date().toISOString()
            };
            return await visitorRepository.update(id, updateData);
        }

        return null;
    }

    async delete(id) {
        return await visitorRepository.delete(id);
    }

    async getStats(factoryId, date) {
        const today = date || new Date().toLocaleDateString('en-CA');

        // In a real production app, this should be a single optimized query in Repository
        // For migration, we keep the logic similar but async
        const allVisitors = await visitorRepository.findAll({ factoryId });

        const todayRequests = allVisitors.filter(v =>
            v.scheduledDate === today
        );

        const onSite = todayRequests.filter(v =>
            v.status === 'approved' &&
            v.visitors.some(vis => vis.checkedIn && !vis.checkOutTime)
        );

        const totalVisitorsOnSite = onSite.reduce((sum, v) =>
            sum + v.visitors.filter(vis => vis.checkedIn && !vis.checkOutTime).length, 0
        );

        return {
            today: todayRequests.length,
            pending: todayRequests.filter(v => v.status === 'pending').length,
            approved: todayRequests.filter(v => v.status === 'approved').length,
            rejected: todayRequests.filter(v => v.status === 'rejected').length,
            onSite: totalVisitorsOnSite,
            checkedOut: todayRequests.filter(v =>
                v.visitors.every(vis => vis.checkOutTime)
            ).length
        };
    }
}

module.exports = new VisitorService();

