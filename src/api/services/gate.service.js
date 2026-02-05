/**
 * Gate Service
 * Business logic for Gate operations (Check-in/out) using MySQL
 */

const visitorRepository = require('../repositories/visitor.repository');
const accessLogRepository = require('../repositories/access-log.repository');
const factoryRepository = require('../repositories/factory.repository');
const userRepository = require('../repositories/user.repository');
const visitorService = require('./visitor.service');

const generateId = (prefix) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

class GateService {
    async getQueue(gateId, factoryId) {
        const today = new Date().toLocaleDateString('en-CA');
        // Fetch all requests to include future 'Ready' ones
        const visitors = await visitorRepository.findAll({ factoryId });

        return visitors.filter(v =>
            (v.status === 'ready' || v.status === 'approved') &&
            v.scheduledDate >= today &&
            v.visitors.some(vis => !vis.checkedIn)
        ).map(v => ({
            ...v,
            visitors: v.visitors.filter(vis => !vis.checkedIn)
        }));
    }

    async getCheckedIn(gateId, factoryId) {
        // Show CHECKED_IN requests
        const visitors = await visitorRepository.findAll({ factoryId, status: 'checked_in' });

        return visitors.filter(v =>
            v.visitors.some(vis => vis.checkedIn && !vis.checkOutTime)
        ).map(v => ({
            ...v,
            visitors: v.visitors.filter(vis => vis.checkedIn && !vis.checkOutTime)
        }));
    }

    async checkIn(requestId, visitorId, gateId, guardId, data = {}) {
        const request = await visitorRepository.findById(requestId);
        if (!request) return { success: false, error: 'Request not found' };

        const visitorIndex = request.visitors.findIndex(v => v.id === visitorId || v.db_id === visitorId);
        if (visitorIndex === -1) return { success: false, error: 'Visitor not found' };

        const visitor = request.visitors[visitorIndex];
        if (visitor.checkedIn) return { success: false, error: 'Already checked in' };

        // Update visitor (Note: in DB this is an entry in access_logs and potentially updating visitor_requests)
        const checkInTime = new Date().toISOString();

        // Update request if needed (e.g. vehicle plate)
        if (data.vehiclePlate) {
            await visitorRepository.update(requestId, { vehiclePlate: data.vehiclePlate });
        }

        // Create access log
        const guard = await userRepository.findById(guardId);
        const gate = await factoryRepository.getGate(request.db_id || request.factoryId, gateId);

        const log = {
            id: generateId('LOG'),
            requestId: request.db_id || requestId,
            visitorId: visitor.db_id || visitor.id,
            visitorName: visitor.fullName,
            company: visitor.company,
            gateId: gate?.id || null,  // Use gate.id (INT) instead of gateId (STRING)
            gateName: gate?.name || 'Unknown Gate',
            factoryId: request.db_id || request.factoryId,
            action: 'checkin',
            timestamp: checkInTime,
            guardId: guardId,
            guardName: guard?.full_name || 'Unknown Guard',
            vehiclePlate: data.vehiclePlate || request.vehiclePlate,
            notes: data.notes || '',
            photo: data.photo || null
        };

        await accessLogRepository.create(log);

        // Update request status to 'checked_in'
        await visitorService.checkIn(requestId, guardId);

        // Update local object for return
        request.visitors[visitorIndex].checkedIn = true;
        request.visitors[visitorIndex].checkInTime = checkInTime;

        return {
            success: true,
            visitor: request.visitors[visitorIndex],
            log: log
        };
    }

    async checkOut(requestId, visitorId, gateId, guardId, data = {}) {
        const request = await visitorRepository.findById(requestId);
        if (!request) return { success: false, error: 'Request not found' };

        const visitorIndex = request.visitors.findIndex(v => v.id === visitorId || v.db_id === visitorId);
        if (visitorIndex === -1) return { success: false, error: 'Visitor not found' };

        const visitor = request.visitors[visitorIndex];
        if (visitor.checkOutTime) return { success: false, error: 'Already checked out' };

        const checkOutTime = new Date().toISOString();

        // Create access log
        const guard = await userRepository.findById(guardId);
        const gate = await factoryRepository.getGate(request.db_id || request.factoryId, gateId);

        const log = {
            id: generateId('LOG'),
            requestId: request.db_id || requestId,
            visitorId: visitor.db_id || visitor.id,
            visitorName: visitor.fullName,
            company: visitor.company,
            gateId: gate?.id || null,  // Use gate.id (INT) instead of gateId (STRING)
            gateName: gate?.name || 'Unknown Gate',
            factoryId: request.db_id || request.factoryId,
            action: 'checkout',
            timestamp: checkOutTime,
            guardId: guardId,
            guardName: guard?.full_name || 'Unknown Guard',
            vehiclePlate: request.vehiclePlate,
            notes: data.notes || '',
            photo: null
        };

        await accessLogRepository.create(log);

        // Update request status to 'checked_out'
        await visitorService.checkOut(requestId, guardId);

        // Update local object for return
        request.visitors[visitorIndex].checkOutTime = checkOutTime;

        return {
            success: true,
            visitor: request.visitors[visitorIndex],
            log: log
        };
    }

    async search(query, factoryId) {
        if (!query || query.length < 2) return [];

        const queryLower = query.toLowerCase();
        // Search in ready and checked_in requests
        const visitors = await visitorRepository.findAll({ factoryId });

        return visitors
            .filter(v => v.status === 'ready' || v.status === 'approved' || v.status === 'checked_in')
            .filter(v =>
                v.id.toLowerCase().includes(queryLower) ||
                v.visitors.some(vis =>
                    vis.fullName.toLowerCase().includes(queryLower) ||
                    (vis.idCard && vis.idCard.includes(query)) ||
                    (vis.phone && vis.phone.includes(query))
                ) ||
                (v.vehiclePlate && v.vehiclePlate.toLowerCase().includes(queryLower))
            );
    }

    async getLogs(filters = {}) {
        return await accessLogRepository.findAll(filters);
    }
}

module.exports = new GateService();

