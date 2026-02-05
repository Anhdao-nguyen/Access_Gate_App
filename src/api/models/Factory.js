/**
 * Factory Model
 */

class Factory {
    constructor(data) {
        this.id = data.id;
        this.code = data.code;
        this.name = data.name;
        this.address = data.address;
        this.gates = data.gates || []; // Array of Gate objects
        this.isActive = data.isActive !== undefined ? data.isActive : true;
    }
}

module.exports = Factory;
