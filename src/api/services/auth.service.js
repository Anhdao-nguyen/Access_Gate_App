/**
 * Auth Service
 * Business logic for authentication
 */

const userRepository = require('../repositories/user.repository');

class AuthService {
    async authenticate(username, password) {
        return await userRepository.authenticate(username, password);
    }
}

module.exports = new AuthService();
