/**
 * User Model
 */

class User {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.password = data.password;
        this.fullName = data.fullName;
        this.role = data.role; // 'admin', 'manager', 'guard', 'user'
        this.factoryId = data.factoryId;
        this.avatar = data.avatar || null;
        this.position = data.position || null;
        this.managerId = data.managerId || data.manager_id || null;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }
}

module.exports = User;
