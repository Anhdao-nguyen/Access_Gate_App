/**
 * Gate & Access Control Routes
 * Now with proper RBAC authorization
 */

const express = require('express');
const router = express.Router();
const gateController = require('../controllers/gate.controller');
const {
    authenticate,
    authorizeOperation,
    applyDataScope,
    guardsOrFullAccess,
    fullAccessOnly
} = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Factory & Gate info (all authenticated users can view)
router.get('/factories', gateController.getFactories);
router.get('/factories/:factoryId/gates', gateController.getGates);

// Dashboard (full access + limited roles)
router.get('/dashboard/stats',
    authorizeOperation('dashboard.stats'),
    applyDataScope,
    gateController.getDashboardStats
);

// Gate operations (guards + full access)
router.get('/gates/:gateId/queue',
    authorizeOperation('gate.queue'),
    gateController.getQueue
);

router.get('/gates/:gateId/checked-in',
    authorizeOperation('gate.checkedIn'),
    gateController.getCheckedIn
);

router.get('/gates/:gateId/search',
    authorizeOperation('gate.search'),
    gateController.search
);

// Access logs (full access only)
router.get('/gates/:gateId/logs',
    authorizeOperation('gate.logs'),
    gateController.getLogs
);

// Check-in / Check-out (guards + full access)
router.post('/gates/:gateId/checkin',
    authorizeOperation('gate.checkin'),
    gateController.checkIn
);

router.post('/gates/:gateId/checkout',
    authorizeOperation('gate.checkout'),
    gateController.checkOut
);

module.exports = router;
