/**
 * Quick Navigation Menu Component with RBAC
 * Access Gate System - Now with role-based filtering
 */

class QuickNavigation {
    constructor() {
        console.log('🚀 QuickNavigation (RBAC): Initializing...');
        this.isOpen = false;
        this.hasMoved = false;
        this.currentPage = this.getCurrentPage();
        this.userRole = this.getUserRole();
        this.init();
        console.log('✅ QuickNavigation: Initialized for role:', this.userRole);
    }

    init() {
        this.createMenuHTML();
        this.attachEventListeners();
        this.initDrag();
        this.setActivePage();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path.includes('home.html')) return 'home';
        if (path.includes('request.html')) return 'request';
        if (path.includes('checkin.html')) return 'checkin';
        if (path.includes('all-requests.html')) return 'all-requests';
        return 'home';
    }

    getUserRole() {
        try {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                return user.role?.toLowerCase() || 'user';
            }
        } catch (e) {
            console.error('Error getting user role:', e);
        }
        return 'user';
    }

    canAccessPage(page) {
        if (!window.RoleConfig) {
            console.warn('RoleConfig not loaded, allowing access');
            return true;
        }
        return window.RoleConfig.canAccessPage(this.userRole, page);
    }

    getMenuItemsHTML() {
        const items = [];

        // All Requests - Only for full access roles
        if (this.canAccessPage('all-requests')) {
            items.push(`
                <a href="/all-requests.html"
                    data-page="all-requests"
                    class="quick-nav-item group flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 pr-5 pl-4 py-3 border-2 border-transparent hover:border-orange-500">
                    <div class="size-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <span class="material-symbols-outlined !text-xl">assignment</span>
                    </div>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">All Requests</span>
                </a>
            `);
        }

        // Check-in Console - For guards and full access
        if (this.canAccessPage('checkin')) {
            items.push(`
                <a href="/checkin.html"
                    data-page="checkin"
                    class="quick-nav-item group flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 pr-5 pl-4 py-3 border-2 border-transparent hover:border-primary">
                    <div class="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <span class="material-symbols-outlined !text-xl">fact_check</span>
                    </div>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">Check-in Console</span>
                </a>
            `);
        }

        // New Request - For most roles except guards
        if (this.canAccessPage('request')) {
            items.push(`
                <a href="/request.html"
                    data-page="request"
                    class="quick-nav-item group flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 pr-5 pl-4 py-3 border-2 border-transparent hover:border-orange-500">
                    <div class="size-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <span class="material-symbols-outlined !text-xl">add_circle</span>
                    </div>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">New Request</span>
                </a>
            `);
        }

        // Dashboard - For most roles except guards
        if (this.canAccessPage('home')) {
            items.push(`
                <a href="/"
                    data-page="home"
                    class="quick-nav-item group flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 pr-5 pl-4 py-3 border-2 border-transparent hover:border-primary">
                    <div class="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <span class="material-symbols-outlined !text-xl">home</span>
                    </div>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">Dashboard</span>
                </a>
            `);
        }

        return items.join('');
    }

    createMenuHTML() {
        const menuHTML = `
            <!-- Quick Navigation Menu (RBAC) -->
            <div id="quick-nav-overlay" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] hidden transition-opacity duration-200 opacity-0"></div>

            <div id="quick-nav-container" class="fixed bottom-6 right-6 z-[100]">
                <!-- Menu Items (Hidden by default) -->
                <div id="quick-nav-items" class="flex flex-col gap-3 mb-3 transform transition-all duration-300 opacity-0 scale-95 pointer-events-none">
                    ${this.getMenuItemsHTML()}
                </div>

                <!-- Main FAB Button -->
                <button id="quick-nav-fab"
                    class="size-14 rounded-full bg-primary text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center group relative">
                    <span class="material-symbols-outlined !text-2xl transition-transform duration-200" id="fab-icon">apps</span>

                    <!-- Tooltip -->
                    <div class="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Quick Menu
                    </div>
                </button>
            </div>
        `;

        console.log('📝 QuickNavigation: Creating filtered menu for role:', this.userRole);
        document.body.insertAdjacentHTML('beforeend', menuHTML);
    }

    attachEventListeners() {
        const fab = document.getElementById('quick-nav-fab');
        const overlay = document.getElementById('quick-nav-overlay');

        fab?.addEventListener('click', (e) => {
            if (!this.hasMoved) {
                this.toggle();
            }
        });

        overlay?.addEventListener('click', () => {
            this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        document.querySelectorAll('.quick-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.close();
            });
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        const overlay = document.getElementById('quick-nav-overlay');
        const items = document.getElementById('quick-nav-items');
        const icon = document.getElementById('fab-icon');

        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('opacity-100'), 10);

        items.classList.remove('pointer-events-none');
        setTimeout(() => {
            items.classList.remove('opacity-0', 'scale-95');
            items.classList.add('opacity-100', 'scale-100');
        }, 10);

        icon.textContent = 'close';
        icon.classList.add('rotate-90');
    }

    close() {
        this.isOpen = false;
        const overlay = document.getElementById('quick-nav-overlay');
        const items = document.getElementById('quick-nav-items');
        const icon = document.getElementById('fab-icon');

        overlay.classList.remove('opacity-100');
        items.classList.remove('opacity-100', 'scale-100');
        items.classList.add('opacity-0', 'scale-95');

        setTimeout(() => {
            overlay.classList.add('hidden');
            items.classList.add('pointer-events-none');
        }, 200);

        icon.textContent = 'apps';
        icon.classList.remove('rotate-90');
    }

    setActivePage() {
        document.querySelectorAll('.quick-nav-item').forEach(item => {
            if (item.dataset.page === this.currentPage) {
                item.classList.add('border-primary', 'bg-primary/5');
                item.querySelector('.size-10')?.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
            }
        });
    }

    initDrag() {
        const container = document.getElementById('quick-nav-container');
        const fab = document.getElementById('quick-nav-fab');

        if (!container || !fab) return;

        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;

        // Restore saved position
        const savedPos = localStorage.getItem('quickNavPosition');
        if (savedPos) {
            try {
                const { left, top } = JSON.parse(savedPos);
                const l = parseFloat(left);
                const t = parseFloat(top);
                const vw = window.innerWidth;
                const vh = window.innerHeight;

                if (!isNaN(l) && !isNaN(t) && l > -20 && l < vw - 20 && t > -20 && t < vh - 20) {
                    container.style.bottom = 'auto';
                    container.style.right = 'auto';
                    container.style.left = left;
                    container.style.top = top;
                }
            } catch (e) {
                console.error('Error restoring position:', e);
            }
        }

        // Drag handlers (simplified - full implementation from original file)
        const handleStart = (clientX, clientY) => {
            isDragging = true;
            this.hasMoved = false;
            startX = clientX;
            startY = clientY;

            const rect = container.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            container.style.bottom = 'auto';
            container.style.right = 'auto';
            container.style.left = initialLeft + 'px';
            container.style.top = initialTop + 'px';

            fab.style.cursor = 'grabbing';
        };

        const handleMove = (clientX, clientY) => {
            if (!isDragging) return;

            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                this.hasMoved = true;
            }

            let newLeft = initialLeft + deltaX;
            let newTop = initialTop + deltaY;

            const maxLeft = window.innerWidth - container.offsetWidth;
            const maxTop = window.innerHeight - container.offsetHeight;

            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));

            container.style.left = `${newLeft}px`;
            container.style.top = `${newTop}px`;
        };

        const handleEnd = () => {
            if (isDragging) {
                isDragging = false;
                fab.style.cursor = '';

                if (this.hasMoved) {
                    localStorage.setItem('quickNavPosition', JSON.stringify({
                        left: container.style.left,
                        top: container.style.top
                    }));
                }
            }
        };

        fab.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                handleStart(e.clientX, e.clientY);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                handleMove(e.clientX, e.clientY);
            }
        });

        document.addEventListener('mouseup', handleEnd);

        fab.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                handleStart(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault();
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        document.addEventListener('touchend', handleEnd);
    }
}

// Initialize on DOM ready
let quickNavigation;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        quickNavigation = new QuickNavigation();
    });
} else {
    quickNavigation = new QuickNavigation();
}
