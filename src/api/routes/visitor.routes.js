/**
 * Visitor Request Routes
 * Now with proper RBAC authorization
 */

const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitor.controller');
const {
    authenticate,
    authorizeOperation,
    applyDataScope,
    canModifyRequest,
    fullAccessOnly,
    requireRoles
} = require('../middleware/auth.middleware');
const { ROLES, ROLE_GROUPS } = require('../../config/roles.config');

// All routes require authentication
router.use(authenticate);

// Stats route (before :id to avoid conflict)
router.get('/stats',
    authorizeOperation('dashboard.stats'),
    applyDataScope,
    visitorController.getStats
);

// CRUD routes with proper authorization
router.get('/',
    authorizeOperation('visitors.list'),
    applyDataScope,
    visitorController.getAll
);

router.get('/:id',
    authorizeOperation('visitors.view'),
    applyDataScope,
    visitorController.getById
);

router.post('/',
    authorizeOperation('visitors.create'),
    visitorController.create
);

router.put('/:id',
    authorizeOperation('visitors.update'),
    applyDataScope,
    canModifyRequest,
    visitorController.update
);

router.delete('/:id',
    authorizeOperation('visitors.delete'),
    applyDataScope,
    canModifyRequest,
    visitorController.delete
);

// Approval workflow
// Manager can approve submitted requests
router.post('/:id/approve',
    authorizeOperation('visitors.approve'),
    visitorController.approve
);

// Plant manager approves manager-approved requests
router.post('/:id/plant-manager-approve',
    requireRoles(ROLES.PLANT_MANAGER, ROLES.ADMIN),
    visitorController.plantManagerApprove
);

// Manager or full access can reject
router.post('/:id/reject',
    authorizeOperation('visitors.reject'),
    visitorController.reject
);

// Check-in/Check-out workflow (guards + full access only)
router.post('/:id/checkin',
    requireRoles(...ROLE_GROUPS.FULL_ACCESS, ...ROLE_GROUPS.CHECKIN_ONLY),
    visitorController.checkIn
);

router.post('/:id/checkout',
    requireRoles(...ROLE_GROUPS.FULL_ACCESS, ...ROLE_GROUPS.CHECKIN_ONLY),
    visitorController.checkOut
);

module.exports = router;
