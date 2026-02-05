/**
 * User Controller
 */

const userRepository = require('../repositories/user.repository');

class UserController {
    async getAll(req, res) {
        try {
            const users = await userRepository.findAll();

            // Remove passwords from response
            const safeUsers = users.map(u => {
                const { password, ...safeUser } = u;
                return {
                    id: safeUser.id,
                    username: safeUser.username,
                    fullName: safeUser.full_name,
                    email: safeUser.email,
                    role: safeUser.role,
                    factoryId: safeUser.factory_id,
                    position: safeUser.position,
                    avatar: safeUser.avatar,
                    managerId: safeUser.manager_id,
                    isActive: safeUser.is_active
                };
            });

            res.json({
                success: true,
                data: safeUsers
            });
        } catch (error) {
            console.error('Error in UserController.getAll:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async getById(req, res) {
        try {
            const user = await userRepository.findById(req.params.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const { password, ...safeUser } = user;
            res.json({
                success: true,
                data: {
                    id: safeUser.id,
                    username: safeUser.username,
                    fullName: safeUser.full_name,
                    email: safeUser.email,
                    role: safeUser.role,
                    factoryId: safeUser.factory_id,
                    position: safeUser.position,
                    avatar: safeUser.avatar,
                    managerId: safeUser.manager_id,
                    isActive: safeUser.is_active
                }
            });
        } catch (error) {
            console.error('Error in UserController.getById:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}

module.exports = new UserController();
