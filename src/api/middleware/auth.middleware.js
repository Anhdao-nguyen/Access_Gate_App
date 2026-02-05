/**
 * Authentication & Authorization Middleware
 * Validates JWT tokens, enforces RBAC, and applies data scope filtering
 */

const authController = require('../controllers/auth.controller');
const { canAccessAPI, isFullAccess, getDataScopeRule, normalizeRole, ROLE_GROUPS } = require('../../config/roles.config');

/**
 * Verify JWT authentication token
 * Attaches decoded user data to req.user if valid
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'No token provided'
        });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = authController.verifyToken(token);

    if (!decoded) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }

    // Normalize role name
    decoded.role = normalizeRole(decoded.role);

    // Normalize user object - map userId to id for consistency
    // JWT contains userId, but code expects id
    req.user = {
        id: decoded.userId || decoded.id,
        userId: decoded.userId || decoded.id,
        username: decoded.username,
        role: decoded.role,
        factoryId: decoded.factoryId,
        db_id: decoded.userId || decoded.id
    };
    req.token = token;
    next();
};

/**
 * Optional authentication - doesn't fail if no token
 * Still attaches user if token is valid
 * DEPRECATED: Use authenticate instead for security
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        const decoded = authController.verifyToken(token);

        if (decoded) {
            decoded.role = normalizeRole(decoded.role);
            // Normalize user object
            req.user = {
                id: decoded.userId || decoded.id,
                userId: decoded.userId || decoded.id,
                username: decoded.username,
                role: decoded.role,
                factoryId: decoded.factoryId,
                db_id: decoded.userId || decoded.id
            };
            req.token = token;
        }
    }

    next();
};

/**
 * Role-based authorization
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
        }

        const userRole = normalizeRole(req.user.role);

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Insufficient permissions.',
                required: allowedRoles,
                actual: userRole
            });
        }

        next();
    };
};

/**
 * API operation-based authorization
 * Checks if user's role has permission to perform the operation
 * @param {string} operation - Operation identifier (e.g., 'visitors.list')
 */
const authorizeOperation = (operation) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
        }

        const userRole = normalizeRole(req.user.role);

        if (!canAccessAPI(userRole, operation)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. You don't have permission to ${operation}`,
                operation,
                role: userRole
            });
        }

        next();
    };
};

/**
 * Apply data scope filtering based on user role
 * Modifies req.query to add appropriate filters
 */
const applyDataScope = (req, res, next) => {
    if (!req.user) {
        return next(); // Skip if no user (will be caught by authenticate)
    }

    const userRole = normalizeRole(req.user.role);
    const scopeRule = getDataScopeRule(userRole);

    // Full access roles - no filtering needed
    if (scopeRule.canViewAll) {
        req.dataScope = { canViewAll: true };
        return next();
    }

    // Apply scope based on role
    req.dataScope = {
        canViewAll: false,
        userId: req.user.id,
        role: userRole
    };

    // Role: bao_ve (guard) - only see ready/checked-in visitors
    if (userRole === 'guard' && scopeRule.onlyStatuses) {
        req.dataScope.statuses = scopeRule.onlyStatuses;
    }

    // Role: manager - only see requests from users with role='user'
    if (scopeRule.onlyRequestedByRole) {
        req.dataScope.requestedByRole = scopeRule.onlyRequestedByRole;
    }

    // Role: user - only see own requests
    if (scopeRule.onlyOwnRequests) {
        req.dataScope.onlyOwn = true;
    }

    next();
};

/**
 * Check if user can modify a specific request
 * Used for update/delete operations
 */
const canModifyRequest = async (req, res, next) => {
    const userRole = normalizeRole(req.user.role);

    // Full access can modify anything
    if (isFullAccess(userRole)) {
        return next();
    }

    // Users can only modify their own requests
    // This will be enforced in the controller by checking request.requestedBy === req.user.id
    req.requiresOwnership = true;
    next();
};

/**
 * Require specific roles (stricter than authorize)
 * Returns 403 if user doesn't have one of the required roles
 */
const requireRoles = (...requiredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const userRole = normalizeRole(req.user.role);

        if (!requiredRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. This operation requires elevated permissions.',
                required: requiredRoles
            });
        }

        next();
    };
};

/**
 * Shorthand middleware combinations
 */

// Full access only (admin, hse_user, le_tan, plant_manager)
const fullAccessOnly = () => {
    return requireRoles(...ROLE_GROUPS.FULL_ACCESS);
};

// Guards only
const guardsOnly = () => {
    return requireRoles(...ROLE_GROUPS.CHECKIN_ONLY);
};

// Guards or full access
const guardsOrFullAccess = () => {
    return requireRoles(...ROLE_GROUPS.FULL_ACCESS, ...ROLE_GROUPS.CHECKIN_ONLY);
};

module.exports = {
    authenticate,
    optionalAuth,
    authorize,
    authorizeOperation,
    applyDataScope,
    canModifyRequest,
    requireRoles,
    fullAccessOnly,
    guardsOnly,
    guardsOrFullAccess
};
