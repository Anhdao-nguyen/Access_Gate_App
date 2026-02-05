/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines role permissions and access rules
 */

// Role constants
const ROLES = {
    ADMIN: 'admin',
    HSE_USER: 'hse',              // Maps to 'hse' in DB
    LE_TAN: 'receptionist',       // Maps to 'receptionist' in DB (lễ tân)
    PLANT_MANAGER: 'plant_manager',
    BAO_VE: 'guard',              // Maps to 'guard' in DB (bảo vệ)
    MANAGER: 'manager',
    USER: 'user'                  // Maps to 'user' in DB (nhân viên)
};

// Role groups for easier permission checking
const ROLE_GROUPS = {
    FULL_ACCESS: [ROLES.ADMIN, ROLES.HSE_USER, ROLES.LE_TAN, ROLES.PLANT_MANAGER],
    CHECKIN_ONLY: [ROLES.BAO_VE],
    LIMITED: [ROLES.USER, ROLES.MANAGER]
};

// Page access permissions
const PAGE_PERMISSIONS = {
    'home': [...ROLE_GROUPS.FULL_ACCESS, ...ROLE_GROUPS.LIMITED],
    'all-requests': ROLE_GROUPS.FULL_ACCESS,
    'request': [...ROLE_GROUPS.FULL_ACCESS, ...ROLE_GROUPS.LIMITED],
    'checkin': [...ROLE_GROUPS.FULL_ACCESS, ...ROLE_GROUPS.CHECKIN_ONLY],
    'profile': Object.values(ROLES) // All roles can access their own profile
};

// API endpoint permissions
const API_PERMISSIONS = {
    // Visitor/Request operations
    'visitors.list': {
        roles: Object.values(ROLES),
        dataScope: true // Requires data scope filtering
    },
    'visitors.view': {
        roles: Object.values(ROLES),
        dataScope: true
    },
    'visitors.create': {
        roles: [...ROLE_GROUPS.FULL_ACCESS, ...ROLE_GROUPS.LIMITED]
    },
    'visitors.update': {
        roles: [...ROLE_GROUPS.FULL_ACCESS, ROLES.USER], // User can update own requests
        dataScope: true
    },
    'visitors.delete': {
        roles: [...ROLE_GROUPS.FULL_ACCESS, ROLES.USER],
        dataScope: true
    },
    'visitors.approve': {
        roles: [...ROLE_GROUPS.FULL_ACCESS, ROLES.MANAGER]
    },
    'visitors.reject': {
        roles: [...ROLE_GROUPS.FULL_ACCESS, ROLES.MANAGER]
    },

    // Gate operations
    'gate.queue': {
        roles: [...ROLE_GROUPS.FULL_ACCESS, ...ROLE_GROUPS.CHECKIN_ONLY]
    },
    'gate.checkedIn': {
        roles: [...ROLE_GROUPS.FULL_ACCESS, ...ROLE_GROUPS.CHECKIN_ONLY]
    },
    'gate.checkin': {
        roles: [...ROLE_GROUPS.FULL_ACCESS, ...ROLE_GROUPS.CHECKIN_ONLY]
    },
    'gate.checkout': {
        roles: [...ROLE_GROUPS.FULL_ACCESS, ...ROLE_GROUPS.CHECKIN_ONLY]
    },
    'gate.search': {
        roles: [...ROLE_GROUPS.FULL_ACCESS, ...ROLE_GROUPS.CHECKIN_ONLY]
    },
    'gate.logs': {
        roles: ROLE_GROUPS.FULL_ACCESS
    },

    // Dashboard
    'dashboard.stats': {
        roles: [...ROLE_GROUPS.FULL_ACCESS, ...ROLE_GROUPS.LIMITED]
    },

    // User management
    'users.list': {
        roles: ROLE_GROUPS.FULL_ACCESS
    },
    'users.view': {
        roles: Object.values(ROLES),
        dataScope: true // Can only view own profile unless full access
    }
};

/**
 * Data scope rules per role
 */
const DATA_SCOPE_RULES = {
    [ROLES.ADMIN]: {
        canViewAll: true,
        description: 'Full access to all data'
    },
    [ROLES.HSE_USER]: {
        canViewAll: true,
        description: 'Full access to all data'
    },
    [ROLES.LE_TAN]: {
        canViewAll: true,
        description: 'Full access to all data'
    },
    [ROLES.PLANT_MANAGER]: {
        canViewAll: true,
        description: 'Full access to all data'
    },
    [ROLES.BAO_VE]: {
        canViewAll: false,
        onlyStatuses: ['ready', 'approved', 'checked_in'],
        description: 'Can only see ready/checked-in visitors at gate'
    },
    [ROLES.MANAGER]: {
        canViewAll: false,
        onlyRequestedByRole: 'user',
        description: 'Can only see requests from users (nhân viên)'
    },
    [ROLES.USER]: {
        canViewAll: false,
        onlyOwnRequests: true,
        description: 'Can only see own requests'
    }
};

/**
 * Helper functions
 */

/**
 * Check if role has access to a page
 */
function canAccessPage(role, page) {
    const allowedRoles = PAGE_PERMISSIONS[page];
    if (!allowedRoles) return false;
    return allowedRoles.includes(role);
}

/**
 * Check if role has access to an API operation
 */
function canAccessAPI(role, operation) {
    const permission = API_PERMISSIONS[operation];
    if (!permission) return false;
    return permission.roles.includes(role);
}

/**
 * Check if role is in full access group
 */
function isFullAccess(role) {
    return ROLE_GROUPS.FULL_ACCESS.includes(role);
}

/**
 * Get data scope rule for a role
 */
function getDataScopeRule(role) {
    return DATA_SCOPE_RULES[role] || DATA_SCOPE_RULES[ROLES.USER];
}

/**
 * Normalize role name (handle DB vs code naming differences)
 */
function normalizeRole(role) {
    const roleMapping = {
        'hse': 'hse',
        'hse_user': 'hse',
        'receptionist': 'receptionist',
        'le_tan': 'receptionist',
        'guard': 'guard',
        'bao_ve': 'guard',
        'plant_manager': 'plant_manager',
        'manager': 'manager',
        'user': 'user',
        'admin': 'admin'
    };

    return roleMapping[role?.toLowerCase()] || role;
}

module.exports = {
    ROLES,
    ROLE_GROUPS,
    PAGE_PERMISSIONS,
    API_PERMISSIONS,
    DATA_SCOPE_RULES,
    canAccessPage,
    canAccessAPI,
    isFullAccess,
    getDataScopeRule,
    normalizeRole
};
