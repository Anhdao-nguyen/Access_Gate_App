/**
 * Visitor Controller
 * Handles CRUD operations for visitor requests using MySQL
 */

const visitorService = require('../services/visitor.service');
const factoryService = require('../services/factory.service');
const dataScopeService = require('../services/data-scope.service');

const visitorController = {
    /**
     * GET /api/v1/visitors
     * Get all visitor requests with optional filters
     * NOW WITH DATA SCOPE FILTERING
     */
    getAll: async (req, res) => {
        try {
            const { status, type, date, search, factoryId, requestedBy } = req.query;

            let filters = {};
            if (status) filters.status = status;
            if (type) filters.type = type;
            if (date) filters.date = date;
            if (search) filters.search = search;
            if (factoryId) filters.factoryId = factoryId;
            if (requestedBy) filters.requestedBy = requestedBy;

            // Default to user's factory if not specified
            if (!filters.factoryId && req.user?.factoryId) {
                filters.factoryId = req.user.factoryId;
            }

            // Apply data scope filtering based on user role
            filters = await dataScopeService.applyVisitorRequestFilters(
                filters,
                req.dataScope,
                req.user
            );

            // If filters indicate no results should be shown
            if (filters._noResults) {
                return res.json({
                    success: true,
                    data: [],
                    pagination: {
                        page: 1,
                        limit: 20,
                        total: 0,
                        totalPages: 0
                    }
                });
            }

            const visitors = await visitorService.findAll(filters);

            // Additional client-side filtering for complex scope rules
            const scopedVisitors = await dataScopeService.filterRequests(
                visitors,
                req.user,
                req.dataScope
            );

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const paginatedData = scopedVisitors.slice(startIndex, endIndex);

            res.json({
                success: true,
                data: paginatedData,
                pagination: {
                    page: page,
                    limit: limit,
                    total: scopedVisitors.length,
                    totalPages: Math.ceil(scopedVisitors.length / limit)
                }
            });
        } catch (error) {
            console.error('Error in getAll visitors:', error);
            console.error('Error stack:', error.stack);
            console.error('Error details:', {
                message: error.message,
                user: req.user?.id,
                dataScope: req.dataScope
            });
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * GET /api/v1/visitors/:id
     * Get a single visitor request by ID
     * NOW WITH DATA SCOPE CHECK
     */
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const visitor = await visitorService.findById(id);

            if (!visitor) {
                return res.status(404).json({
                    success: false,
                    error: 'Visitor request not found'
                });
            }

            // Check if user has permission to view this request
            const canView = await dataScopeService.canViewRequest(
                visitor,
                req.user,
                req.dataScope
            );

            if (!canView) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. You do not have permission to view this request.'
                });
            }

            res.json({
                success: true,
                data: visitor
            });
        } catch (error) {
            console.error('Error in getById visitor:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * POST /api/v1/visitors
     * Create a new visitor request
     */
    create: async (req, res) => {
        try {
            const {
                type,
                purpose,
                accessArea,
                scheduledDate,
                scheduledTime,
                visitors,
                host,
                vehiclePlate,
                notes,
                factoryId
            } = req.body;

            // Validation
            if (!purpose || !scheduledDate || !scheduledTime || !visitors || visitors.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: purpose, scheduledDate, scheduledTime, visitors'
                });
            }

            if (!host || !host.name) {
                return res.status(400).json({
                    success: false,
                    error: 'Host information is required'
                });
            }

            // Validate each visitor (only fullName and company are required)
            for (let i = 0; i < visitors.length; i++) {
                const v = visitors[i];
                if (!v.fullName || !v.company) {
                    return res.status(400).json({
                        success: false,
                        error: `Visitor ${i + 1}: fullName and company are required`
                    });
                }

                // Validate PPE for non-office areas
                if (accessArea && accessArea.toLowerCase() !== 'office') {
                    if (!v.ppeHairnet && !v.ppeSafetyShoes) {
                        return res.status(400).json({
                            success: false,
                            error: `Visitor ${i + 1} (${v.fullName}): At least one Safety Equipment (PPE) is required for non-office areas`
                        });
                    }
                    if (v.ppeSafetyShoes && !v.shoeSize) {
                        return res.status(400).json({
                            success: false,
                            error: `Visitor ${i + 1} (${v.fullName}): Shoe size is required when Safety Shoes is selected`
                        });
                    }
                }
            }

            const newRequest = await visitorService.create({
                type: type || 'visitor',
                purpose,
                accessArea: accessArea || 'office',
                scheduledDate,
                scheduledTime,
                visitors,
                host,
                vehiclePlate,
                notes,
                factoryId: factoryId || req.user?.factoryId || 1, // Use 1 as default numeric ID if available
                requestedBy: req.user?.id || 1 // Use 1 as default PK if available
            });

            res.status(201).json({
                success: true,
                data: newRequest,
                message: 'Visitor request created successfully'
            });
        } catch (error) {
            console.error('Error in create visitor:', error);
            console.error('Error stack:', error.stack);
            console.error('Request body:', req.body);
            console.error('User:', req.user);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * PUT /api/v1/visitors/:id
     * Update a visitor request
     * NOW WITH OWNERSHIP CHECK
     */
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await visitorService.findById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    error: 'Visitor request not found'
                });
            }

            // Check if user can modify this request
            const canModify = await dataScopeService.canModifyRequest(
                existing,
                req.user,
                req.dataScope
            );

            if (!canModify) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. You can only modify your own requests.'
                });
            }

            // Only allow updates to pending/submitted requests
            if (!['pending', 'submitted'].includes(existing.status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot update a request that has been approved or rejected'
                });
            }

            const updated = await visitorService.update(id, req.body);

            res.json({
                success: true,
                data: updated,
                message: 'Visitor request updated successfully'
            });
        } catch (error) {
            console.error('Error in update visitor:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * POST /api/v1/visitors/:id/approve
     * Manager approve a visitor request (submitted -> manager_approved)
     */
    approve: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await visitorService.findById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    error: 'Visitor request not found'
                });
            }

            if (existing.status !== 'submitted') {
                return res.status(400).json({
                    success: false,
                    error: 'Request must be in submitted status'
                });
            }

            const approved = await visitorService.approve(id, req.user?.id || 1);

            res.json({
                success: true,
                data: approved,
                message: 'Request approved by manager successfully'
            });
        } catch (error) {
            console.error('Error in approve visitor:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * POST /api/v1/visitors/:id/plant-manager-approve
     * Plant Manager approve a visitor request (manager_approved -> ready)
     */
    plantManagerApprove: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await visitorService.findById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    error: 'Visitor request not found'
                });
            }

            if (existing.status !== 'manager_approved') {
                return res.status(400).json({
                    success: false,
                    error: 'Request must be approved by manager first'
                });
            }

            const approved = await visitorService.plantManagerApprove(id, req.user?.id || 1);

            res.json({
                success: true,
                data: approved,
                message: 'Request approved by plant manager - Ready for check-in'
            });
        } catch (error) {
            console.error('Error in plant manager approve:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * POST /api/v1/visitors/:id/checkin
     * Guard check-in a visitor (ready -> checked_in)
     */
    checkIn: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await visitorService.findById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    error: 'Visitor request not found'
                });
            }

            if (existing.status !== 'ready') {
                return res.status(400).json({
                    success: false,
                    error: 'Request must be in ready status'
                });
            }

            const checkedIn = await visitorService.checkIn(id, req.user?.id || 1);

            res.json({
                success: true,
                data: checkedIn,
                message: 'Visitor checked in successfully'
            });
        } catch (error) {
            console.error('Error in check-in visitor:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * POST /api/v1/visitors/:id/checkout
     * Guard check-out a visitor (checked_in -> checked_out)
     */
    checkOut: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await visitorService.findById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    error: 'Visitor request not found'
                });
            }

            if (existing.status !== 'checked_in') {
                return res.status(400).json({
                    success: false,
                    error: 'Visitor must be checked in first'
                });
            }

            const checkedOut = await visitorService.checkOut(id, req.user?.id || 1);

            res.json({
                success: true,
                data: checkedOut,
                message: 'Visitor checked out successfully'
            });
        } catch (error) {
            console.error('Error in check-out visitor:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * POST /api/v1/visitors/:id/reject
     * Reject a visitor request
     */
    reject: async (req, res) => {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const existing = await visitorService.findById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    error: 'Visitor request not found'
                });
            }

            if (existing.status !== 'submitted' && existing.status !== 'manager_approved') {
                return res.status(400).json({
                    success: false,
                    error: 'Can only reject submitted or manager approved requests'
                });
            }

            const rejected = await visitorService.reject(id, req.user?.id || 1, reason || 'No reason provided');

            res.json({
                success: true,
                data: rejected,
                message: 'Visitor request rejected'
            });
        } catch (error) {
            console.error('Error in reject visitor:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * DELETE /api/v1/visitors/:id
     * Delete a visitor request
     * NOW WITH OWNERSHIP CHECK
     */
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await visitorService.findById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    error: 'Visitor request not found'
                });
            }

            // Check if user can modify this request
            const canModify = await dataScopeService.canModifyRequest(
                existing,
                req.user,
                req.dataScope
            );

            if (!canModify) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. You can only delete your own requests.'
                });
            }

            // Only allow deletion of pending/submitted requests
            if (!['pending', 'submitted'].includes(existing.status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot delete a request that has been approved or rejected'
                });
            }

            await visitorService.delete(id);

            res.json({
                success: true,
                message: 'Visitor request deleted successfully'
            });
        } catch (error) {
            console.error('Error in delete visitor:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * GET /api/v1/visitors/stats
     * Get visitor statistics
     */
    getStats: async (req, res) => {
        try {
            const factoryId = req.query.factoryId || req.user?.factoryId || 1;
            const date = req.query.date;

            const stats = await visitorService.getStats(factoryId, date);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error in getStats visitors:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
};

module.exports = visitorController;

