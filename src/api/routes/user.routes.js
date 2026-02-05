/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes (if any)
// Protected routes
router.use(authenticate);

router.get('/', userController.getAll);
router.get('/:id', userController.getById);

module.exports = router;
