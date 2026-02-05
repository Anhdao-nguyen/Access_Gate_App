/**
 * API Client for GateKeeper Access System
 * Centralized API calls for frontend
 */

const API_BASE_URL = '/api/v1';

// Store auth token in memory (can be moved to localStorage for persistence)
let authToken = localStorage.getItem('authToken') || null;

/**
 * Set authentication token
 */
function setAuthToken(token) {
    authToken = token;
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }
}

/**
 * Get authentication token
 */
function getAuthToken() {
    return authToken;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return !!authToken;
}

/**
 * Make API request with error handling
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Add auth token if available
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

// ==================== AUTH API ====================

const AuthAPI = {
    /**
     * Login user
     * @param {string} username
     * @param {string} password
     */
    login: async (username, password) => {
        const result = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (result.success && result.data.token) {
            setAuthToken(result.data.token);
        }

        return result;
    },

    /**
     * Logout user
     */
    logout: async () => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } finally {
            setAuthToken(null);
        }
    },

    /**
     * Get current user info
     */
    me: async () => {
        return apiRequest('/auth/me');
    },

    /**
     * Get current user from localStorage or API
     */
    getCurrentUser: () => {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Save current user to localStorage
     */
    setCurrentUser: (user) => {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }
};

// ==================== VISITOR API ====================

const VisitorAPI = {
    /**
     * Get all visitor requests
     * @param {Object} filters - { status, type, date, search, page, limit }
     */
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });

        const queryString = params.toString();
        return apiRequest(`/visitors${queryString ? '?' + queryString : ''}`);
    },

    /**
     * Get visitor request by ID
     * @param {string} id
     */
    getById: async (id) => {
        return apiRequest(`/visitors/${id}`);
    },

    /**
     * Create new visitor request
     * @param {Object} data
     */
    create: async (data) => {
        return apiRequest('/visitors', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * Update visitor request
     * @param {string} id
     * @param {Object} data
     */
    update: async (id, data) => {
        return apiRequest(`/visitors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    /**
     * Delete visitor request
     * @param {string} id
     */
    delete: async (id) => {
        return apiRequest(`/visitors/${id}`, {
            method: 'DELETE'
        });
    },

    /**
     * Approve visitor request
     * @param {string} id
     */
    approve: async (id) => {
        return apiRequest(`/visitors/${id}/approve`, {
            method: 'POST'
        });
    },

    /**
     * Plant Manager approve visitor request (manager_approved -> ready)
     * @param {string} id
     */
    plantManagerApprove: async (id) => {
        return apiRequest(`/visitors/${id}/plant-manager-approve`, {
            method: 'POST'
        });
    },

    /**
     * Reject visitor request
     * @param {string} id
     * @param {string} reason
     */
    reject: async (id, reason) => {
        return apiRequest(`/visitors/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    },

    /**
     * Check in visitor (ready -> checked_in)
     * @param {string} id - Request ID
     */
    checkIn: async (id) => {
        return apiRequest(`/visitors/${id}/checkin`, {
            method: 'POST'
        });
    },

    /**
     * Check out visitor (checked_in -> checked_out)
     * @param {string} id - Request ID
     */
    checkOut: async (id) => {
        return apiRequest(`/visitors/${id}/checkout`, {
            method: 'POST'
        });
    },

    /**
     * Get visitor statistics
     * @param {string} factoryId
     * @param {string} date
     */
    getStats: async (factoryId, date) => {
        const params = new URLSearchParams();
        if (factoryId) params.append('factoryId', factoryId);
        if (date) params.append('date', date);

        return apiRequest(`/visitors/stats?${params.toString()}`);
    }
};

// ==================== GATE API ====================

const GateOperations = {
    /**
     * Get expected visitors queue
     * @param {string} gateId
     * @param {string} factoryId
     */
    getQueue: async (gateId = 1, factoryId) => {
        const params = new URLSearchParams();
        if (factoryId) params.append('factoryId', factoryId);

        return apiRequest(`/gates/${gateId}/queue?${params.toString()}`);
    },

    /**
     * Get checked-in visitors
     * @param {string} gateId
     * @param {string} factoryId
     */
    getCheckedIn: async (gateId = 1, factoryId) => {
        const params = new URLSearchParams();
        if (factoryId) params.append('factoryId', factoryId);

        return apiRequest(`/gates/${gateId}/checked-in?${params.toString()}`);
    },

    /**
     * Check in a visitor
     * @param {string} gateId
     * @param {Object} data - { requestId, visitorId, vehiclePlate, notes }
     */
    checkIn: async (gateId, data) => {
        return apiRequest(`/gates/${gateId}/checkin`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * Check out a visitor
     * @param {string} gateId
     * @param {Object} data - { requestId, visitorId, notes }
     */
    checkOut: async (gateId, data) => {
        return apiRequest(`/gates/${gateId}/checkout`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * Search visitors
     * @param {string} gateId
     * @param {string} query
     * @param {string} factoryId
     */
    search: async (gateId, query, factoryId) => {
        const params = new URLSearchParams({ q: query });
        if (factoryId) params.append('factoryId', factoryId);

        return apiRequest(`/gates/${gateId}/search?${params.toString()}`);
    },

    /**
     * Get access logs
     * @param {string} gateId
     * @param {Object} filters - { action, date, page, limit }
     */
    getLogs: async (gateId = 'all', filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });

        return apiRequest(`/gates/${gateId}/logs?${params.toString()}`);
    }
};

// ==================== FACTORY API ====================

const FactoryAPI = {
    /**
     * Get all factories
     */
    getAll: async () => {
        return apiRequest('/factories');
    },

    /**
     * Get gates for a factory
     * @param {string} factoryId
     */
    getGates: async (factoryId) => {
        return apiRequest(`/factories/${factoryId}/gates`);
    }
};

// ==================== DASHBOARD API ====================

const DashboardAPI = {
    /**
     * Get dashboard statistics
     * @param {string} factoryId
     */
    getStats: async (factoryId) => {
        const params = new URLSearchParams();
        if (factoryId) params.append('factoryId', factoryId);

        return apiRequest(`/dashboard/stats?${params.toString()}`);
    }
};

// ==================== USER API ====================

const UserAPI = {
    /**
     * Get all users
     */
    getAll: async () => {
        return apiRequest('/users');
    },

    /**
     * Get user by ID
     * @param {string} id
     */
    getById: async (id) => {
        return apiRequest(`/users/${id}`);
    }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format date for display
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Format time for display
 */
function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format date and time for display
 */
function formatDateTime(dateStr) {
    return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
    const statusConfig = {
        pending: {
            bg: 'bg-yellow-100 dark:bg-yellow-900/40',
            text: 'text-yellow-800 dark:text-yellow-200',
            label: 'Pending'
        },
        approved: {
            bg: 'bg-green-100 dark:bg-green-900/40',
            text: 'text-green-800 dark:text-green-200',
            label: 'Approved'
        },
        rejected: {
            bg: 'bg-red-100 dark:bg-red-900/40',
            text: 'text-red-800 dark:text-red-200',
            label: 'Rejected'
        },
        checkedin: {
            bg: 'bg-blue-100 dark:bg-blue-900/40',
            text: 'text-blue-800 dark:text-blue-200',
            label: 'Checked In'
        }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return `<span class="text-xs font-bold px-2.5 py-1 rounded-full ${config.bg} ${config.text}">${config.label}</span>`;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Create toast container if not exists
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(container);
    }

    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-600',
        info: 'bg-blue-600'
    };

    const toast = document.createElement('div');
    toast.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    toast.textContent = message;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.remove('translate-x-full'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Show loading state
 */
function showLoading(element, show = true) {
    if (show) {
        element.classList.add('opacity-50', 'pointer-events-none');
    } else {
        element.classList.remove('opacity-50', 'pointer-events-none');
    }
}

// Export for use in other scripts
window.GateAPI = {
    Auth: AuthAPI,
    Visitor: VisitorAPI,
    Gate: GateOperations,
    Factory: FactoryAPI,
    Dashboard: DashboardAPI,
    User: UserAPI,
    // Utilities
    setAuthToken,
    getAuthToken,
    isAuthenticated,
    formatDate,
    formatTime,
    formatDateTime,
    getStatusBadge,
    showToast,
    showLoading
};

console.log('GateAPI Client loaded successfully');
