/**
 * Visitor Request Model
 */

class VisitorRequest {
    constructor(data) {
        this.id = data.id;
        this.type = data.type || 'visitor';
        this.status = data.status || 'pending'; // 'pending', 'approved', 'rejected'
        this.factoryId = data.factoryId;
        this.purpose = data.purpose;
        this.accessArea = data.accessArea || 'office';
        this.scheduledDate = data.scheduledDate;
        this.scheduledTime = data.scheduledTime;

        // Array of visitor objects
        this.visitors = data.visitors || [];

        this.host = data.host; // { name, department, phone }
        this.vehiclePlate = data.vehiclePlate || null;
        this.notes = data.notes || '';
        this.requestedBy = data.requestedBy;
        this.managerApproverId = data.managerApproverId || data.manager_approver_id || null;
        this.approvedBy = data.approvedBy || null;
        this.rejectedBy = data.rejectedBy || null;
        this.rejectionReason = data.rejectionReason || null;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }
}

module.exports = VisitorRequest;
