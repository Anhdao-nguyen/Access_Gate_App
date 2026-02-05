/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticate, authController.me);
router.post('/refresh', authenticate, authController.refresh);
router.get('/users', authenticate, authorize('admin'), authController.getUsers);

module.exports = router;
