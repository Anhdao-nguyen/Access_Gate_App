/**
 * Factory Service
 * Business logic for Factory management
 */

const factoryRepository = require('../repositories/factory.repository');

class FactoryService {
    async findAll() {
        return await factoryRepository.findAll();
    }

    async findById(id) {
        return await factoryRepository.findById(id);
    }

    async findByCode(code) {
        return await factoryRepository.findByCode(code);
    }

    async getGates(factoryId) {
        return await factoryRepository.getGates(factoryId);
    }

    async getGate(factoryId, gateId) {
        return await factoryRepository.getGate(factoryId, gateId);
    }
}

module.exports = new FactoryService();

