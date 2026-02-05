/**
 * Authentication Controller
 * Handles login, logout, and user session management with JWT
 */

const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');
const authService = require('../services/auth.service');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'gatekeeper-secret-key-2024';
const JWT_EXPIRES_IN = '24h';

// Blacklisted tokens (for logout)
const tokenBlacklist = new Set();

/**
 * Generate JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            username: user.username,
            role: user.role,
            factoryId: user.factoryId
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
    try {
        if (tokenBlacklist.has(token)) {
            return null;
        }
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const authController = {
    /**
     * POST /api/v1/auth/login
     * Authenticate user and return JWT token
     */
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Username and password are required'
                });
            }

            const user = await authService.authenticate(username, password);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid username or password'
                });
            }

            // Generate JWT token
            const token = generateToken(user);

            res.json({
                success: true,
                data: {
                    token: token,
                    expiresIn: JWT_EXPIRES_IN,
                    user: user
                },
                message: 'Login successful'
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * POST /api/v1/auth/logout
     * Invalidate user token
     */
    logout: (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (token) {
                tokenBlacklist.add(token);
            }

            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * GET /api/v1/auth/me
     * Get current user info
     */
    me: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }

            // Get fresh user data
            const user = await userService.findById(req.user.userId);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const { password: _, ...safeUser } = user;

            res.json({
                success: true,
                data: safeUser
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * POST /api/v1/auth/refresh
     * Refresh JWT token
     */
    refresh: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }

            const user = await userService.findById(req.user.userId);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const { password: _, ...safeUser } = user;
            const newToken = generateToken(safeUser);

            res.json({
                success: true,
                data: {
                    token: newToken,
                    expiresIn: JWT_EXPIRES_IN,
                    user: safeUser
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * GET /api/v1/auth/users
     * Get all users (admin only)
     */
    getUsers: async (req, res) => {
        try {
            const users = await userService.findAll();

            res.json({
                success: true,
                data: users.map(u => {
                    const { password, ...safeUser } = u;
                    return safeUser;
                })
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    // Export utilities for middleware
    verifyToken,
    tokenBlacklist
};

module.exports = authController;
