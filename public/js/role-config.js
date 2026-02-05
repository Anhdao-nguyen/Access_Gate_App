/**
 * Frontend Role Configuration
 * Mirrors backend role config for client-side UI control
 * NOTE: This is NOT for security - actual enforcement is on backend
 */

const RoleConfig = {
    ROLES: {
        ADMIN: 'admin',
        HSE_USER: 'hse',
        LE_TAN: 'receptionist',
        PLANT_MANAGER: 'plant_manager',
        BAO_VE: 'guard',
        MANAGER: 'manager',
        USER: 'user'
    },

    ROLE_GROUPS: {
        FULL_ACCESS: ['admin', 'hse', 'receptionist', 'plant_manager'],
        CHECKIN_ONLY: ['guard'],
        LIMITED: ['user', 'manager']
    },

    PAGE_PERMISSIONS: {
        'home': ['admin', 'hse', 'receptionist', 'plant_manager', 'user', 'manager'],
        'home.html': ['admin', 'hse', 'receptionist', 'plant_manager', 'user', 'manager'],
        'all-requests': ['admin', 'hse', 'receptionist', 'plant_manager'],
        'all-requests.html': ['admin', 'hse', 'receptionist', 'plant_manager'],
        'request': ['admin', 'hse', 'receptionist', 'plant_manager', 'user', 'manager'],
        'request.html': ['admin', 'hse', 'receptionist', 'plant_manager', 'user', 'manager'],
        'checkin': ['admin', 'hse', 'receptionist', 'plant_manager', 'guard'],
        'checkin.html': ['admin', 'hse', 'receptionist', 'plant_manager', 'guard'],
        'profile': ['admin', 'hse', 'receptionist', 'plant_manager', 'guard', 'user', 'manager']
    },

    /**
     * Normalize role name
     */
    normalizeRole(role) {
        if (!role) return null;
        return role.toLowerCase().trim();
    },

    /**
     * Check if role can access a page
     */
    canAccessPage(role, pagePath) {
        const normalizedRole = this.normalizeRole(role);
        if (!normalizedRole) return false;

        // Extract page name from path
        const pageName = this.extractPageName(pagePath);

        const allowedRoles = this.PAGE_PERMISSIONS[pageName];
        if (!allowedRoles) {
            // If page not in config, only allow full access
            return this.ROLE_GROUPS.FULL_ACCESS.includes(normalizedRole);
        }

        return allowedRoles.includes(normalizedRole);
    },

    /**
     * Extract page name from path
     */
    extractPageName(path) {
        if (path === '/' || path === '/home' || path === '/home.html' || path === '/index.html') {
            return 'home';
        }

        // Remove leading slash and .html extension
        let pageName = path.replace(/^\//, '').replace(/\.html$/, '');

        // Handle edge cases
        if (pageName === '' || pageName === 'index') {
            pageName = 'home';
        }

        return pageName;
    },

    /**
     * Get allowed pages for a role
     */
    getAllowedPages(role) {
        const normalizedRole = this.normalizeRole(role);
        if (!normalizedRole) return [];

        const allowed = [];
        for (const [page, roles] of Object.entries(this.PAGE_PERMISSIONS)) {
            if (roles.includes(normalizedRole)) {
                allowed.push(page);
            }
        }
        return allowed;
    },

    /**
     * Check if role is in full access group
     */
    isFullAccess(role) {
        const normalizedRole = this.normalizeRole(role);
        return this.ROLE_GROUPS.FULL_ACCESS.includes(normalizedRole);
    },

    /**
     * Format role for display (Vietnamese)
     */
    formatRole(role) {
        const roleMap = {
            'admin': 'Quản trị viên',
            'hse': 'HSE User',
            'receptionist': 'Lễ tân',
            'plant_manager': 'Plant Manager',
            'guard': 'Bảo vệ',
            'manager': 'Quản lý',
            'user': 'Nhân viên'
        };

        const normalizedRole = this.normalizeRole(role);
        return roleMap[normalizedRole] || role;
    }
};

// Make it globally available
window.RoleConfig = RoleConfig;
