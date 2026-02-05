/**
 * User Service
 * Business logic for user management
 */

const userRepository = require('../repositories/user.repository');

class UserService {
    async findAll() {
        return await userRepository.findAll();
    }

    async findById(id) {
        return await userRepository.findById(id);
    }

    async findByUsername(username) {
        return await userRepository.findByUsername(username);
    }

    async create(userData) {
        return await userRepository.create(userData);
    }

    async update(id, userData) {
        return await userRepository.update(id, userData);
    }

    async delete(id) {
        return await userRepository.delete(id);
    }
}

module.exports = new UserService();
