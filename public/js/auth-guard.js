/**
 * Authentication & Authorization Guard
 * Redirects to login if user is not authenticated
 * Redirects to access denied if user doesn't have permission for the page
 * Include this script on pages that require authentication
 */

(function() {
    'use strict';

    // Pages that don't require authentication
    const publicPages = ['/login', '/login.html', '/access-denied.html'];

    // Check if current page is public
    const currentPath = window.location.pathname;
    const isPublicPage = publicPages.some(page => currentPath.endsWith(page) || currentPath === page);

    if (isPublicPage) {
        return; // Don't check auth on public pages
    }

    // Check if user is authenticated
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Not authenticated, redirect to login
        console.log('No auth token found, redirecting to login...');
        window.location.href = '/login';
        return;
    }

    // Verify token is still valid by checking expiry
    try {
        // JWT tokens are base64 encoded with 3 parts: header.payload.signature
        const parts = token.split('.');
        if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const expiry = payload.exp * 1000; // Convert to milliseconds

            if (Date.now() >= expiry) {
                // Token expired
                console.log('Token expired, redirecting to login...');
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                window.location.href = '/login';
                return;
            }
        }
    } catch (e) {
        // Invalid token format
        console.error('Invalid token format:', e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
        return;
    }

    // Token is valid, now check role-based authorization
    console.log('User authenticated');

    // Check if user has permission to access this page
    checkPageAccess();

    // Update UI with user info when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        updateUserUI();
    });

    /**
     * Check if user has permission to access current page
     */
    function checkPageAccess() {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) {
            console.error('No user data found');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            const userRole = user.role;

            // Check if RoleConfig is loaded
            if (typeof RoleConfig === 'undefined') {
                console.warn('RoleConfig not loaded yet, skipping permission check');
                // Load role-config.js dynamically if not loaded
                const script = document.createElement('script');
                script.src = '/js/role-config.js';
                script.onload = function() {
                    performPageAccessCheck(userRole);
                };
                document.head.appendChild(script);
                return;
            }

            performPageAccessCheck(userRole);
        } catch (e) {
            console.error('Error checking page access:', e);
        }
    }

    /**
     * Perform actual page access check
     */
    function performPageAccessCheck(userRole) {
        if (!window.RoleConfig) {
            console.error('RoleConfig not available');
            return;
        }

        const hasAccess = window.RoleConfig.canAccessPage(userRole, currentPath);

        if (!hasAccess) {
            console.warn(`Access denied: Role "${userRole}" cannot access "${currentPath}"`);
            alert(`Access Denied\n\nBạn không có quyền truy cập trang này.\nVai trò của bạn: ${window.RoleConfig.formatRole(userRole)}`);

            // Redirect to appropriate page based on role
            redirectToAllowedPage(userRole);
        } else {
            console.log(`Access granted: Role "${userRole}" can access "${currentPath}"`);
        }
    }

    /**
     * Redirect user to a page they have access to
     */
    function redirectToAllowedPage(userRole) {
        const allowedPages = window.RoleConfig.getAllowedPages(userRole);

        if (allowedPages.length === 0) {
            // No pages accessible, logout
            handleLogout();
            return;
        }

        // Determine best page to redirect to
        let redirectTo = '/home.html'; // Default

        if (userRole === 'guard') {
            // Guards go to checkin page
            redirectTo = '/checkin.html';
        } else if (allowedPages.includes('home') || allowedPages.includes('home.html')) {
            // Most users go to home/dashboard
            redirectTo = '/home.html';
        } else {
            // Otherwise go to first allowed page
            const firstPage = allowedPages[0].replace(/^\//, '');
            redirectTo = `/${firstPage}`;
            if (!firstPage.endsWith('.html')) {
                redirectTo += '.html';
            }
        }

        console.log(`Redirecting to allowed page: ${redirectTo}`);
        window.location.href = redirectTo;
    }

    /**
     * Update UI elements with current user info
     */
    function updateUserUI() {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) return;

        try {
            const user = JSON.parse(userStr);

            // Update user name displays - show username instead of fullName
            document.querySelectorAll('[data-user-name]').forEach(el => {
                el.textContent = user.username || user.fullName;
            });

            // Update user role displays - use RoleConfig if available
            document.querySelectorAll('[data-user-role]').forEach(el => {
                if (window.RoleConfig) {
                    el.textContent = window.RoleConfig.formatRole(user.role);
                } else {
                    el.textContent = formatRole(user.role);
                }
            });

            // Update user department displays
            document.querySelectorAll('[data-user-department]').forEach(el => {
                el.textContent = user.department || '';
            });

            // Update avatar if exists
            document.querySelectorAll('[data-user-avatar]').forEach(el => {
                if (user.avatar) {
                    el.style.backgroundImage = `url(${user.avatar})`;
                } else {
                    // Set initials as fallback - use username
                    const initials = getInitials(user.username || user.fullName);
                    el.innerHTML = `<span class="text-lg font-bold">${initials}</span>`;
                    el.classList.add('flex', 'items-center', 'justify-center', 'bg-primary/10', 'text-primary');
                }
            });

            // Show/hide elements based on role
            document.querySelectorAll('[data-role-required]').forEach(el => {
                const requiredRoles = el.dataset.roleRequired.split(',').map(r => r.trim());
                if (!requiredRoles.includes(user.role)) {
                    el.style.display = 'none';
                }
            });

            // Update greeting - use username
            const greetingEl = document.querySelector('[data-greeting]');
            if (greetingEl) {
                const hour = new Date().getHours();
                let greeting = 'Hello';
                if (hour < 12) greeting = 'Good morning';
                else if (hour < 18) greeting = 'Good afternoon';
                else greeting = 'Good evening';

                greetingEl.textContent = `${greeting}, ${user.username || user.fullName}`;
            }

        } catch (e) {
            console.error('Error updating user UI:', e);
        }
    }

    /**
     * Format role for display (fallback if RoleConfig not loaded)
     */
    function formatRole(role) {
        const roleMap = {
            'admin': 'Quản trị viên',
            'hse': 'HSE User',
            'receptionist': 'Lễ tân',
            'plant_manager': 'Plant Manager',
            'guard': 'Bảo vệ',
            'manager': 'Quản lý',
            'user': 'Nhân viên'
        };
        return roleMap[role?.toLowerCase()] || role;
    }

    /**
     * Get initials from name
     */
    function getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    /**
     * Handle logout
     */
    window.handleLogout = async function() {
        try {
            if (window.GateAPI) {
                await GateAPI.Auth.logout();
            }
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
        }
    };

    // Attach logout handlers to logout buttons
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[data-logout], .logout-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    handleLogout();
                }
            });
        });
    });

})();
