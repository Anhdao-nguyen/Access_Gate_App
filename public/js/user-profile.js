/**
 * User Profile Drawer Component
 * Access Gate System
 */

class UserProfileDrawer {
    constructor() {
        this.isOpen = false;
        this.userRole = 'user'; // 'manager' or 'user'
        this.userData = null;
        this.init();
    }

    init() {
        this.createDrawerHTML();
        this.attachEventListeners();
        this.loadUserData();
    }

    createDrawerHTML() {
        const drawerHTML = `
            <!-- Profile Drawer Overlay -->
            <div id="profile-overlay" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 hidden transition-opacity duration-300 opacity-0"></div>
            
            <!-- Profile Drawer -->
            <div id="profile-drawer" class="fixed top-0 right-0 h-full w-full md:w-[420px] bg-white dark:bg-slate-900 shadow-2xl z-50 transform translate-x-full transition-transform duration-300 ease-out overflow-y-auto">
                <!-- Header -->
                <div class="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 z-10">
                    <div class="flex items-center justify-between p-4">
                        <h2 class="text-lg font-bold text-slate-900 dark:text-white">My Profile</h2>
                        <button id="close-profile" class="size-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span class="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
                        </button>
                    </div>
                </div>

                <!-- Profile Info -->
                <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div class="flex flex-col items-center gap-4">
                        <!-- Avatar -->
                        <div class="relative">
                            <div id="profile-avatar" class="bg-center bg-no-repeat bg-cover rounded-full size-24 ring-4 ring-primary/20 shadow-lg"
                                style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCkIETe0nx6serWlZSHNCb-fPbFfejUNyNhHkg_ewUpIPZGzxYgeo94s3fatn6ANAIvJuehTqeC5CmS8MIwsHcLgh3Gbyw1HcB4NH7_NKrH3YNlNkNrkDisK0z3XpZpeBoK40f0UcyAW40BFNfYNcFPrWuzOWESQ0I9AkiuHpFYMg2e1xD_BcxoOcCm2m3aGLNeA_80CA2FL07KYXrDFy3R4O26zVYSjv22KjTt2OPPDxaCHbgwn9BAlMUoccRp6Fp9AMR7IPO_0FWN");'>
                            </div>
                            <div class="absolute bottom-1 right-1 size-5 bg-green-500 rounded-full border-4 border-white dark:border-slate-900"></div>
                        </div>
                        
                        <!-- Name & Role -->
                        <div class="text-center">
                            <h3 id="profile-name" class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Admin User</h3>
                            <span id="profile-role-badge" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                <span class="material-symbols-outlined !text-base">badge</span>
                                <span id="profile-role-text">Plant Manager</span>
                            </span>
                        </div>

                        <!-- Info Cards -->
                        <div class="w-full space-y-2 mt-2">
                            <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span class="material-symbols-outlined text-slate-500">person</span>
                                <span id="profile-fullname" class="text-sm font-medium text-slate-700 dark:text-slate-300">Nguyen Van A</span>
                            </div>
                            <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span class="material-symbols-outlined text-slate-500">work</span>
                                <span id="profile-position" class="text-sm font-medium text-slate-700 dark:text-slate-300">Operations Manager</span>
                            </div>
                            <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span class="material-symbols-outlined text-slate-500">factory</span>
                                <span id="profile-plant" class="text-sm font-medium text-slate-700 dark:text-slate-300">Long An Plant</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Content Area (Role-based) -->
                <div id="profile-content" class="p-6">
                    <!-- Loading State -->
                    <div id="profile-loading" class="space-y-4">
                        <div class="animate-pulse space-y-3">
                            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                            <div class="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div class="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div class="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                    </div>

                    <!-- Manager Content -->
                    <div id="manager-content" class="hidden">
                        <!-- KPI Cards -->
                        <div class="grid grid-cols-3 gap-3 mb-6">
                            <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 text-center border border-yellow-200 dark:border-yellow-800">
                                <p class="text-3xl font-bold text-yellow-900 dark:text-yellow-200" id="kpi-pending">12</p>
                                <p class="text-xs font-semibold text-yellow-700 dark:text-yellow-400 uppercase mt-1">Pending</p>
                            </div>
                            <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
                                <p class="text-3xl font-bold text-blue-900 dark:text-blue-200" id="kpi-today">5</p>
                                <p class="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase mt-1">Today</p>
                            </div>
                            <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
                                <p class="text-3xl font-bold text-green-900 dark:text-green-200" id="kpi-week">28</p>
                                <p class="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mt-1">This Week</p>
                            </div>
                        </div>

                        <!-- Section Header -->
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Pending Approvals</h3>
                            <select id="approval-filter" class="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary">
                                <option value="all">All</option>
                                <option value="pending" selected>Pending</option>
                                <option value="today">Today</option>
                            </select>
                        </div>

                        <!-- Approvals List -->
                        <div id="approvals-list" class="space-y-3">
                            <!-- Items will be inserted here -->
                        </div>

                        <!-- Empty State -->
                        <div id="approvals-empty" class="hidden text-center py-12">
                            <div class="inline-flex items-center justify-center size-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                                <span class="material-symbols-outlined !text-4xl">check_circle</span>
                            </div>
                            <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-2">All caught up!</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400">No pending approvals at the moment</p>
                        </div>
                    </div>

                    <!-- User Content -->
                    <div id="user-content" class="hidden">
                        <!-- Section Header -->
                        <div class="mb-4">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-3">My Requests</h3>
                            
                            <!-- Search & Filter -->
                            <div class="space-y-2">
                                <input type="text" id="request-search" placeholder="Search by name, company, or ID..." 
                                    class="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm">
                                
                                <div class="flex gap-2">
                                    <select id="request-filter" class="flex-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary">
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    <select id="request-sort" class="flex-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary">
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Requests List -->
                        <div id="requests-list" class="space-y-3">
                            <!-- Items will be inserted here -->
                        </div>

                        <!-- Empty State -->
                        <div id="requests-empty" class="hidden text-center py-12">
                            <div class="inline-flex items-center justify-center size-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
                                <span class="material-symbols-outlined !text-4xl">description</span>
                            </div>
                            <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-2">No requests yet</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Create your first visitor request to get started</p>
                            <a href="/request.html" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                                <span class="material-symbols-outlined !text-lg">add</span>
                                New Request
                            </a>
                        </div>
                    </div>

                    <!-- Error State -->
                    <div id="profile-error" class="hidden text-center py-12">
                        <div class="inline-flex items-center justify-center size-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                            <span class="material-symbols-outlined !text-4xl">warning</span>
                        </div>
                        <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Oops! Something went wrong</h4>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Unable to load your profile data</p>
                        <button id="retry-load" class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <span class="material-symbols-outlined !text-lg">refresh</span>
                            Try Again
                        </button>
                    </div>
                </div>

                <!-- Footer -->
                <div class="sticky bottom-0 p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-auto">
                    <button id="sign-out-btn" class="w-full h-12 flex items-center justify-center gap-2 bg-white dark:bg-transparent border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg font-bold hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300 transition-all">
                        <span class="material-symbols-outlined">logout</span>
                        Sign Out
                    </button>
                </div>
            </div>

            <!-- Request Detail Modal -->
            <div id="request-detail-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] hidden items-center justify-center p-4">
                <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform scale-95 opacity-0 transition-all duration-200">
                    <!-- Modal content will be inserted here -->
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', drawerHTML);
    }

    attachEventListeners() {
        // Avatar click to open
        document.addEventListener('click', (e) => {
            const avatar = e.target.closest('[data-open-profile]');
            if (avatar) {
                this.open();
            }
        });

        // Close button
        document.getElementById('close-profile')?.addEventListener('click', () => this.close());

        // Overlay click to close
        document.getElementById('profile-overlay')?.addEventListener('click', () => this.close());

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Sign out
        document.getElementById('sign-out-btn')?.addEventListener('click', () => this.signOut());

        // Retry button
        document.getElementById('retry-load')?.addEventListener('click', () => this.loadUserData());

        // Filter changes
        document.getElementById('approval-filter')?.addEventListener('change', (e) => {
            this.filterApprovals(e.target.value);
        });

        document.getElementById('request-filter')?.addEventListener('change', () => {
            this.filterRequests();
        });

        document.getElementById('request-search')?.addEventListener('input', () => {
            this.filterRequests();
        });

        document.getElementById('request-sort')?.addEventListener('change', () => {
            this.filterRequests();
        });
    }

    open() {
        this.isOpen = true;
        const drawer = document.getElementById('profile-drawer');
        const overlay = document.getElementById('profile-overlay');

        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('opacity-100'), 10);

        setTimeout(() => {
            drawer.classList.remove('translate-x-full');
        }, 10);

        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        const drawer = document.getElementById('profile-drawer');
        const overlay = document.getElementById('profile-overlay');

        drawer.classList.add('translate-x-full');
        overlay.classList.remove('opacity-100');

        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 300);

        document.body.style.overflow = '';
    }

    async loadUserData() {
        // Show loading
        document.getElementById('profile-loading')?.classList.remove('hidden');
        document.getElementById('manager-content')?.classList.add('hidden');
        document.getElementById('user-content')?.classList.add('hidden');
        document.getElementById('profile-error')?.classList.add('hidden');

        try {
            // Simulate API call - Replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock data - Replace with actual API response
            this.userData = {
                name: 'Admin User',
                fullName: 'Nguyen Van A',
                position: 'Operations Manager',
                plant: 'Long An Plant',
                role: 'manager', // or 'user'
                avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkIETe0nx6serWlZSHNCb-fPbFfejUNyNhHkg_ewUpIPZGzxYgeo94s3fatn6ANAIvJuehTqeC5CmS8MIwsHcLgh3Gbyw1HcB4NH7_NKrH3YNlNkNrkDisK0z3XpZpeBoK40f0UcyAW40BFNfYNcFPrWuzOWESQ0I9AkiuHpFYMg2e1xD_BcxoOcCm2m3aGLNeA_80CA2FL07KYXrDFy3R4O26zVYSjv22KjTt2OPPDxaCHbgwn9BAlMUoccRp6Fp9AMR7IPO_0FWN'
            };

            this.userRole = this.userData.role;

            // Update UI
            this.updateProfileInfo();

            // Load role-specific content
            if (this.userRole === 'manager') {
                await this.loadApprovals();
            } else {
                await this.loadRequests();
            }

            // Hide loading
            document.getElementById('profile-loading')?.classList.add('hidden');

        } catch (error) {
            console.error('Error loading user data:', error);
            document.getElementById('profile-loading')?.classList.add('hidden');
            document.getElementById('profile-error')?.classList.remove('hidden');
        }
    }

    updateProfileInfo() {
        document.getElementById('profile-name').textContent = this.userData.name;
        document.getElementById('profile-fullname').textContent = this.userData.fullName;
        document.getElementById('profile-position').textContent = this.userData.position;
        document.getElementById('profile-plant').textContent = this.userData.plant;
        document.getElementById('profile-role-text').textContent = this.userRole === 'manager' ? 'Plant Manager' : 'User';

        const avatar = document.getElementById('profile-avatar');
        if (avatar) {
            avatar.style.backgroundImage = `url("${this.userData.avatar}")`;
        }
    }

    async loadApprovals() {
        document.getElementById('manager-content')?.classList.remove('hidden');

        // Mock data - Replace with actual API
        const approvals = [
            {
                id: 'REQ-2024-0123',
                visitorName: 'Sarah Connor',
                company: 'Cyberdyne Systems',
                date: 'Jan 20, 2024',
                time: '10:30 AM',
                requestedBy: 'John Doe',
                status: 'pending',
                avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVbs7SEODhdr7n97OKsG4IdQXAVYnAUAuw_q6otw77ems0Xz6BLxz8QGeLA_40U9jKv6MckkHVb6hLcl2JtoVXzlmy0SZt2BjOXX6GmBg2Jysh4A33JOQFkTEYlc-1_NtuV8dSOcJ3irCWu5M2KGq4I_S0sgjaJWEEPaQHM3zn-RFO4oB8GjdwlY4B6UB-dUuNgfEyw9kQWzTcM_SuRXn_q49yRy03uI9jfWlHyCZhi44IRe0Q3XcPPSnSzkinSlhpSXlKBpgg6SNJ'
            },
            {
                id: 'REQ-2024-0124',
                visitorName: 'John Wick',
                company: 'Continental Hotel',
                date: 'Jan 20, 2024',
                time: '2:00 PM',
                requestedBy: 'Jane Smith',
                status: 'pending',
                avatar: null
            }
        ];

        this.renderApprovals(approvals);
    }

    renderApprovals(approvals) {
        const container = document.getElementById('approvals-list');
        const emptyState = document.getElementById('approvals-empty');

        if (!approvals || approvals.length === 0) {
            container.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');
        container.innerHTML = approvals.map(approval => `
            <div class="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/30 hover:shadow-md transition-all bg-white dark:bg-slate-800">
                <div class="flex items-start gap-3 mb-3">
                    ${approval.avatar ?
                `<div class="size-12 rounded-full bg-cover bg-center flex-shrink-0" style="background-image: url('${approval.avatar}')"></div>` :
                `<div class="size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <span class="material-symbols-outlined text-slate-400">person</span>
                        </div>`
            }
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-slate-900 dark:text-white truncate">${approval.visitorName}</h4>
                        <p class="text-sm text-slate-600 dark:text-slate-400 truncate">${approval.company}</p>
                    </div>
                    <span class="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 text-xs font-bold uppercase">Pending</span>
                </div>
                
                <div class="space-y-1.5 mb-4 text-sm">
                    <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined !text-base">badge</span>
                        <span class="font-mono font-semibold">${approval.id}</span>
                    </div>
                    <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined !text-base">event</span>
                        <span>${approval.date} • ${approval.time}</span>
                    </div>
                    <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span class="material-symbols-outlined !text-base">person</span>
                        <span>Requested by: ${approval.requestedBy}</span>
                    </div>
                </div>

                <div class="flex gap-2">
                    <button onclick="userProfile.approveRequest('${approval.id}')" class="flex-1 h-10 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1">
                        <span class="material-symbols-outlined !text-lg">check</span>
                        Approve
                    </button>
                    <button onclick="userProfile.rejectRequest('${approval.id}')" class="flex-1 h-10 px-4 bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-900/50 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-1">
                        <span class="material-symbols-outlined !text-lg">close</span>
                        Reject
                    </button>
                    <button onclick="userProfile.viewRequestDetail('${approval.id}')" class="h-10 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center">
                        <span class="material-symbols-outlined !text-lg">visibility</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadRequests() {
        document.getElementById('user-content')?.classList.remove('hidden');

        // Mock data - Replace with actual API
        const requests = [
            {
                id: 'REQ-2024-0156',
                purpose: 'Visitor Meeting',
                visitorName: 'Sarah Connor',
                company: 'Cyberdyne Systems',
                date: 'Jan 25, 2024',
                time: '2:00 PM',
                area: 'Office Area',
                status: 'approved',
                createdDate: 'Jan 18, 2024'
            },
            {
                id: 'REQ-2024-0145',
                purpose: 'Business Meeting',
                visitorName: 'John Wick',
                company: 'Continental Hotel',
                date: 'Jan 22, 2024',
                time: '10:00 AM',
                area: 'Operation Area',
                status: 'pending',
                createdDate: 'Jan 17, 2024'
            }
        ];

        this.allRequests = requests;
        this.renderRequests(requests);
    }

    renderRequests(requests) {
        const container = document.getElementById('requests-list');
        const emptyState = document.getElementById('requests-empty');

        if (!requests || requests.length === 0) {
            container.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');

        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
            cancelled: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
        };

        container.innerHTML = requests.map(request => `
            <div class="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/30 hover:shadow-md transition-all bg-white dark:bg-slate-800">
                <div class="flex items-start justify-between mb-3">
                    <span class="text-sm font-mono font-bold text-slate-900 dark:text-white">${request.id}</span>
                    <span class="px-2.5 py-1 rounded-full ${statusColors[request.status]} text-xs font-bold uppercase">${request.status}</span>
                </div>

                <div class="mb-3">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined !text-lg text-primary">groups</span>
                        <h4 class="font-semibold text-slate-900 dark:text-white">${request.purpose}</h4>
                    </div>
                    <p class="text-sm text-slate-600 dark:text-slate-400">${request.visitorName} • ${request.company}</p>
                </div>

                <div class="space-y-1.5 mb-4 text-sm text-slate-600 dark:text-slate-400">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined !text-base">event</span>
                        <span>${request.date} at ${request.time}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined !text-base">location_on</span>
                        <span>${request.area}</span>
                    </div>
                    <div class="text-xs text-slate-500">Created: ${request.createdDate}</div>
                </div>

                <div class="flex gap-2">
                    ${request.status === 'pending' ?
                `<button onclick="userProfile.cancelRequest('${request.id}')" class="flex-1 h-10 px-4 bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-900/50 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                            Cancel
                        </button>` :
                ''
            }
                    <button onclick="userProfile.viewRequestDetail('${request.id}')" class="flex-1 h-10 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterApprovals(filter) {
        // Implement filtering logic
        console.log('Filter approvals:', filter);
    }

    filterRequests() {
        const searchTerm = document.getElementById('request-search')?.value.toLowerCase() || '';
        const filterStatus = document.getElementById('request-filter')?.value || 'all';
        const sortOrder = document.getElementById('request-sort')?.value || 'newest';

        let filtered = [...(this.allRequests || [])];

        // Search
        if (searchTerm) {
            filtered = filtered.filter(req =>
                req.id.toLowerCase().includes(searchTerm) ||
                req.visitorName.toLowerCase().includes(searchTerm) ||
                req.company.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(req => req.status === filterStatus);
        }

        // Sort
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdDate);
            const dateB = new Date(b.createdDate);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        this.renderRequests(filtered);
    }

    approveRequest(id) {
        if (confirm(`Approve request ${id}?`)) {
            console.log('Approving:', id);
            // Implement API call
            alert('Request approved successfully!');
            this.loadApprovals();
        }
    }

    rejectRequest(id) {
        const reason = prompt(`Reject request ${id}?\n\nPlease provide a reason:`);
        if (reason) {
            console.log('Rejecting:', id, 'Reason:', reason);
            // Implement API call
            alert('Request rejected.');
            this.loadApprovals();
        }
    }

    cancelRequest(id) {
        if (confirm(`Cancel request ${id}?`)) {
            console.log('Cancelling:', id);
            // Implement API call
            alert('Request cancelled.');
            this.loadRequests();
        }
    }

    viewRequestDetail(id) {
        console.log('View detail:', id);
        // Implement modal with full details
        alert(`View details for ${id}\n\n(Modal implementation coming next)`);
    }

    signOut() {
        if (confirm('Are you sure you want to sign out?')) {
            console.log('Signing out...');
            // Implement sign out logic
            window.location.href = '/login.html';
        }
    }
}

// Initialize on DOM ready
let userProfile;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        userProfile = new UserProfileDrawer();
    });
} else {
    userProfile = new UserProfileDrawer();
}
