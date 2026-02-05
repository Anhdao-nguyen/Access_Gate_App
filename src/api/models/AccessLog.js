/**
 * Access Log Model
 */

class AccessLog {
    constructor(data) {
        this.id = data.id;
        this.requestId = data.requestId;
        this.visitorId = data.visitorId;
        this.visitorName = data.visitorName;
        this.company = data.company;
        this.gateId = data.gateId;
        this.gateName = data.gateName;
        this.factoryId = data.factoryId;
        this.action = data.action; // 'checkin', 'checkout'
        this.timestamp = data.timestamp || new Date().toISOString();
        this.guardId = data.guardId;
        this.guardName = data.guardName;
        this.vehiclePlate = data.vehiclePlate || null;
        this.notes = data.notes || '';
        this.photo = data.photo || null;
    }
}

module.exports = AccessLog;
