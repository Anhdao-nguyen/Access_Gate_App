/**
 * Dashboard Service
 * Business logic for Dashboard statistics using MySQL
 */

const visitorService = require('./visitor.service');
const accessLogRepository = require('../repositories/access-log.repository');
const visitorRepository = require('../repositories/visitor.repository');

class DashboardService {
    async getStats(factoryId) {
        return await visitorService.getStats(factoryId, new Date().toISOString().split('T')[0]);
    }

    async getRecentActivity(factoryId, limit = 10) {
        return await accessLogRepository.findByFactoryId(factoryId, limit);
    }

    async getOverstayAlerts(factoryId, maxHours = 8) {
        const now = new Date();
        const alerts = [];

        // Find approved visitors in the factory
        const requests = await visitorRepository.findAll({ factoryId, status: 'approved' });

        requests.forEach(request => {
            request.visitors.forEach(visitor => {
                if (visitor.checkedIn && !visitor.checkOutTime) {
                    const checkInTime = new Date(visitor.checkInTime);
                    const hoursOnSite = (now - checkInTime) / (1000 * 60 * 60);

                    if (hoursOnSite > maxHours) {
                        alerts.push({
                            requestId: request.id,
                            visitor: visitor,
                            checkInTime: visitor.checkInTime,
                            hoursOnSite: Math.round(hoursOnSite * 10) / 10,
                            host: request.host
                        });
                    }
                }
            });
        });

        return alerts;
    }
}

module.exports = new DashboardService();

