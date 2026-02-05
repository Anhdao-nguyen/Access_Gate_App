/**
 * Gate Controller
 * Handles check-in/check-out operations at security gates using MySQL
 */

const gateService = require('../services/gate.service');
const factoryService = require('../services/factory.service');
const dashboardService = require('../services/dashboard.service');

const gateController = {
    /**
     * GET /api/v1/gates/:gateId/queue
     * Get expected visitors waiting to check in
     */
    getQueue: async (req, res) => {
        try {
            const { gateId } = req.params;
            const factoryId = req.query.factoryId || req.user?.factoryId || 1;

            const queue = await gateService.getQueue(gateId, factoryId);

            res.json({
                success: true,
                data: queue,
                count: queue.reduce((sum, r) => sum + r.visitors.length, 0)
            });
        } catch (error) {
            console.error('Error in getQueue:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * GET /api/v1/gates/:gateId/checked-in
     * Get currently checked-in visitors
     */
    getCheckedIn: async (req, res) => {
        try {
            const { gateId } = req.params;
            const factoryId = req.query.factoryId || req.user?.factoryId || 1;

            const checkedIn = await gateService.getCheckedIn(gateId, factoryId);

            res.json({
                success: true,
                data: checkedIn,
                count: checkedIn.reduce((sum, r) => sum + r.visitors.length, 0)
            });
        } catch (error) {
            console.error('Error in getCheckedIn:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * POST /api/v1/gates/:gateId/checkin
     * Check in a visitor
     */
    checkIn: async (req, res) => {
        try {
            const { gateId } = req.params;
            const { requestId, visitorId, vehiclePlate, notes } = req.body;

            if (!requestId || !visitorId) {
                return res.status(400).json({
                    success: false,
                    error: 'requestId and visitorId are required'
                });
            }

            const guardId = req.user?.id || 1;

            const result = await gateService.checkIn(requestId, visitorId, gateId, guardId, {
                vehiclePlate,
                notes
            });

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }

            res.json({
                success: true,
                data: {
                    visitor: result.visitor,
                    log: result.log
                },
                message: 'Check-in successful'
            });
        } catch (error) {
            console.error('Error in checkIn:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * POST /api/v1/gates/:gateId/checkout
     * Check out a visitor
     */
    checkOut: async (req, res) => {
        try {
            const { gateId } = req.params;
            const { requestId, visitorId, notes } = req.body;

            if (!requestId || !visitorId) {
                return res.status(400).json({
                    success: false,
                    error: 'requestId and visitorId are required'
                });
            }

            const guardId = req.user?.id || 1;

            const result = await gateService.checkOut(requestId, visitorId, gateId, guardId, {
                notes
            });

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }

            res.json({
                success: true,
                data: {
                    visitor: result.visitor,
                    log: result.log
                },
                message: 'Check-out successful'
            });
        } catch (error) {
            console.error('Error in checkOut:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * GET /api/v1/gates/:gateId/search
     * Search for visitors (by name, ID card, phone, vehicle plate)
     */
    search: async (req, res) => {
        try {
            const { gateId } = req.params;
            const { q } = req.query;
            const factoryId = req.query.factoryId || req.user?.factoryId || 1;

            if (!q || q.length < 2) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query must be at least 2 characters'
                });
            }

            const results = await gateService.search(q, factoryId);

            res.json({
                success: true,
                data: results,
                count: results.length
            });
        } catch (error) {
            console.error('Error in search:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * GET /api/v1/gates/:gateId/logs
     * Get access logs for a gate
     */
    getLogs: async (req, res) => {
        try {
            const { gateId } = req.params;
            const { action, date } = req.query;
            const factoryId = req.query.factoryId || req.user?.factoryId || 1;

            const filters = { factoryId };
            if (gateId && gateId !== 'all') filters.gateId = gateId;
            if (action) filters.action = action;
            if (date) filters.date = date;

            const logs = await gateService.getLogs(filters);

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const paginatedData = logs.slice(startIndex, endIndex);

            res.json({
                success: true,
                data: paginatedData,
                pagination: {
                    page: page,
                    limit: limit,
                    total: logs.length,
                    totalPages: Math.ceil(logs.length / limit)
                }
            });
        } catch (error) {
            console.error('Error in getLogs:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * GET /api/v1/factories
     * Get all factories
     */
    getFactories: async (req, res) => {
        try {
            const factories = await factoryService.findAll();

            res.json({
                success: true,
                data: factories
            });
        } catch (error) {
            console.error('Error in getFactories:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * GET /api/v1/factories/:factoryId/gates
     * Get gates for a factory
     */
    getGates: async (req, res) => {
        try {
            const { factoryId } = req.params;
            const gates = await factoryService.getGates(factoryId);

            res.json({
                success: true,
                data: gates
            });
        } catch (error) {
            console.error('Error in getGates:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * GET /api/v1/dashboard/stats
     * Get dashboard statistics
     */
    getDashboardStats: async (req, res) => {
        try {
            const factoryId = req.query.factoryId || req.user?.factoryId || 1;

            const stats = await dashboardService.getStats(factoryId);
            const recentActivity = await dashboardService.getRecentActivity(factoryId, 10);
            const overstayAlerts = await dashboardService.getOverstayAlerts(factoryId);

            res.json({
                success: true,
                data: {
                    stats: stats,
                    recentActivity: recentActivity,
                    overstayAlerts: overstayAlerts
                }
            });
        } catch (error) {
            console.error('Error in getDashboardStats:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
};

module.exports = gateController;

