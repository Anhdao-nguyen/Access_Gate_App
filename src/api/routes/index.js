/**
 * API Routes Aggregator
 * Combines all route modules
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const visitorRoutes = require('./visitor.routes');
const gateRoutes = require('./gate.routes');
const userRoutes = require('./user.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/visitors', visitorRoutes);
router.use('/users', userRoutes);
router.use('/', gateRoutes); // Gates, factories, dashboard at root level

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'GateKeeper API v1',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /auth/login': 'Authenticate user',
                'POST /auth/logout': 'Logout user',
                'GET /auth/me': 'Get current user info'
            },
            visitors: {
                'GET /visitors': 'List all visitor requests',
                'GET /visitors/:id': 'Get visitor request by ID',
                'POST /visitors': 'Create new visitor request',
                'PUT /visitors/:id': 'Update visitor request',
                'DELETE /visitors/:id': 'Delete visitor request',
                'POST /visitors/:id/approve': 'Approve request',
                'POST /visitors/:id/reject': 'Reject request',
                'GET /visitors/stats': 'Get visitor statistics'
            },
            users: {
                'GET /users': 'List all users',
                'GET /users/:id': 'Get user by ID'
            },
            gates: {
                'GET /factories': 'List all factories',
                'GET /factories/:id/gates': 'Get gates for a factory',
                'GET /gates/:id/queue': 'Get expected visitors',
                'GET /gates/:id/checked-in': 'Get checked-in visitors',
                'POST /gates/:id/checkin': 'Check in a visitor',
                'POST /gates/:id/checkout': 'Check out a visitor',
                'GET /gates/:id/search': 'Search visitors',
                'GET /gates/:id/logs': 'Get access logs'
            },
            dashboard: {
                'GET /dashboard/stats': 'Get dashboard statistics'
            }
        }
    });
});

module.exports = router;
