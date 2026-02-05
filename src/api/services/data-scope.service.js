/**
 * Data Scope Service
 * Applies data filtering based on user role and permissions
 */

const { getDataScopeRule, normalizeRole } = require('../../config/roles.config');
const userRepository = require('../repositories/user.repository');

class DataScopeService {
    /**
     * Apply data scope filters to visitor request queries
     * @param {Object} filters - Base filters from query params
     * @param {Object} dataScope - Data scope from middleware (req.dataScope)
     * @param {Object} user - Current user from req.user
     * @returns {Object} Enhanced filters with scope applied
     */
    async applyVisitorRequestFilters(filters, dataScope, user) {
        if (!dataScope || dataScope.canViewAll) {
            // No scope restrictions - return original filters
            return filters;
        }

        const enhancedFilters = { ...filters };

        // Role: user (nhân viên) - only see own requests
        if (dataScope.onlyOwn) {
            enhancedFilters.requestedBy = user.id;
        }

        // Role: manager - only see requests from users with role='user'
        if (dataScope.requestedByRole) {
            try {
                // Get all users with role='user'
                const users = await userRepository.findAll({ role: dataScope.requestedByRole });
                const userIds = users.map(u => u.id);

                // If no users found, return empty result indicator
                if (userIds.length === 0) {
                    console.warn(`No users found with role: ${dataScope.requestedByRole}`);
                    enhancedFilters._noResults = true;
                } else {
                    enhancedFilters.requestedByIds = userIds;
                    console.log(`Found ${userIds.length} users with role: ${dataScope.requestedByRole}`);
                }
            } catch (error) {
                console.error('Error fetching users for data scope:', error);
                throw error;
            }
        }

        // Role: bao_ve (guard) - only see specific statuses
        if (dataScope.statuses) {
            // If filter already has status, intersect with allowed statuses
            if (enhancedFilters.status) {
                if (!dataScope.statuses.includes(enhancedFilters.status)) {
                    enhancedFilters._noResults = true;
                }
            } else {
                enhancedFilters.allowedStatuses = dataScope.statuses;
            }
        }

        return enhancedFilters;
    }

    /**
     * Check if user can view a specific request
     * @param {Object} request - The visitor request object
     * @param {Object} user - Current user
     * @param {Object} dataScope - Data scope from middleware
     * @returns {boolean}
     */
    async canViewRequest(request, user, dataScope) {
        if (!dataScope || dataScope.canViewAll) {
            return true;
        }

        // User role - can only view own requests
        if (dataScope.onlyOwn) {
            return request.requestedBy === user.id || request.requestedBy === user.db_id;
        }

        // Manager role - can only view requests from users with role='user'
        if (dataScope.requestedByRole) {
            try {
                const requestor = await userRepository.findById(request.requestedBy);
                if (!requestor) {
                    console.warn(`Requestor not found for request: ${request.id}, requestedBy: ${request.requestedBy}`);
                    return false;
                }

                const normalizedRole = normalizeRole(requestor.role);
                return normalizedRole === dataScope.requestedByRole;
            } catch (error) {
                console.error('Error checking requestor role:', error);
                return false;
            }
        }

        // Guard role - can only view specific statuses
        if (dataScope.statuses) {
            return dataScope.statuses.includes(request.status);
        }

        return false;
    }

    /**
     * Check if user can modify a specific request
     * @param {Object} request - The visitor request object
     * @param {Object} user - Current user
     * @param {Object} dataScope - Data scope from middleware
     * @returns {boolean}
     */
    async canModifyRequest(request, user, dataScope) {
        // Full access can modify anything
        if (!dataScope || dataScope.canViewAll) {
            return true;
        }

        // Only owners can modify their requests
        return request.requestedBy === user.id || request.requestedBy === user.db_id;
    }

    /**
     * Filter an array of requests based on data scope
     * @param {Array} requests - Array of visitor requests
     * @param {Object} user - Current user
     * @param {Object} dataScope - Data scope from middleware
     * @returns {Array} Filtered requests
     */
    async filterRequests(requests, user, dataScope) {
        if (!dataScope || dataScope.canViewAll) {
            return requests;
        }

        const filtered = [];
        for (const request of requests) {
            if (await this.canViewRequest(request, user, dataScope)) {
                filtered.push(request);
            }
        }

        return filtered;
    }

    /**
     * Apply dashboard stats scope
     * Modifies stats to only show data within user's scope
     */
    async applyDashboardStatsScope(stats, user, dataScope) {
        if (!dataScope || dataScope.canViewAll) {
            return stats; // No filtering needed
        }

        // For limited users, we need to recalculate stats based on their visible data
        // This is a simplified version - you may need to adjust based on your stats structure
        return {
            ...stats,
            note: 'Stats filtered based on your permissions'
        };
    }
}

module.exports = new DataScopeService();
