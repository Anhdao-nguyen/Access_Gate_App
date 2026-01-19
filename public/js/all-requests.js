/**
 * All Requests Page - Main Controller
 * Access Gate System
 */

class AllRequestsPage {
    constructor() {
        this.currentPage = 1;
        this.perPage = 20;
        this.totalCount = 0;
        this.sortBy = 'created';
        this.sortOrder = 'desc';
        this.filters = {
            search: '',
            site: 'all',
            type: 'all',
            status: 'all',
            from: this.getDefaultFromDate(),
            to: this.getDefaultToDate()
        };
        this.allRequests = [];
        this.userRole = 'admin'; // Will be fetched from API
        this.userSites = ['long_an', 'tay_ninh']; // Will be fetched from API

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDates();
        this.loadRequests();
    }

    getDefaultFromDate() {
        const date = new Date();
        date.setDate(date.getDate() - 7); // Last 7 days
        return date.toISOString().split('T')[0];
    }

    getDefaultToDate() {
        return new Date().toISOString().split('T')[0];
    }

    setDefaultDates() {
        document.getElementById('filter-from').value = this.filters.from;
        document.getElementById('filter-to').value = this.filters.to;
    }

    setupEventListeners() {
        // Search with debounce
        let searchTimeout;
        document.getElementById('search-input').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.loadRequests();
            }, 300);
        });

        // Filter changes
        ['filter-site', 'filter-type', 'filter-status', 'filter-from', 'filter-to'].forEach(id => {
            document.getElementById(id).addEventListener('change', (e) => {
                const filterName = id.replace('filter-', '');
                this.filters[filterName] = e.target.value;
                this.currentPage = 1;
                this.loadRequests();
                this.updateActiveFilters();
            });
        });

        // Reset filters
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetFilters();
        });

        // Export
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        // Table sorting
        document.querySelectorAll('[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const sortBy = th.dataset.sort;
                if (this.sortBy === sortBy) {
                    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortBy = sortBy;
                    this.sortOrder = 'desc';
                }
                this.loadRequests();
            });
        });
    }

    resetFilters() {
        this.filters = {
            search: '',
            site: 'all',
            type: 'all',
            status: 'all',
            from: this.getDefaultFromDate(),
            to: this.getDefaultToDate()
        };

        document.getElementById('search-input').value = '';
        document.getElementById('filter-site').value = 'all';
        document.getElementById('filter-type').value = 'all';
        document.getElementById('filter-status').value = 'all';
        this.setDefaultDates();

        this.currentPage = 1;
        this.loadRequests();
        this.updateActiveFilters();
    }

    updateActiveFilters() {
        const container = document.getElementById('active-filters');
        const chips = [];

        if (this.filters.site !== 'all') {
            const siteSelect = document.getElementById('filter-site');
            const siteName = siteSelect.options[siteSelect.selectedIndex].text;
            chips.push(this.createFilterChip('Site', siteName, 'site'));
        }

        if (this.filters.type !== 'all') {
            const typeSelect = document.getElementById('filter-type');
            const typeName = typeSelect.options[typeSelect.selectedIndex].text;
            chips.push(this.createFilterChip('Type', typeName, 'type'));
        }

        if (this.filters.status !== 'all') {
            const statusSelect = document.getElementById('filter-status');
            const statusName = statusSelect.options[statusSelect.selectedIndex].text;
            chips.push(this.createFilterChip('Status', statusName, 'status'));
        }

        container.innerHTML = chips.join('');
    }

    createFilterChip(label, value, filterKey) {
        return `
            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                <span>${label}: ${value}</span>
                <button onclick="allRequestsPage.removeFilter('${filterKey}')" class="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
                    <span class="material-symbols-outlined !text-base">close</span>
                </button>
            </div>
        `;
    }

    removeFilter(filterKey) {
        this.filters[filterKey] = 'all';
        document.getElementById(`filter-${filterKey}`).value = 'all';
        this.currentPage = 1;
        this.loadRequests();
        this.updateActiveFilters();
    }

    async loadRequests() {
        this.showLoading();

        try {
            // Simulate API call - Replace with actual endpoint
            await new Promise(resolve => setTimeout(resolve, 500));

            // Mock data
            const mockData = this.getMockData();

            // Apply filters
            let filtered = this.applyFilters(mockData);

            // Apply sorting
            filtered = this.applySorting(filtered);

            // Calculate pagination
            this.totalCount = filtered.length;
            const start = (this.currentPage - 1) * this.perPage;
            const end = start + this.perPage;
            const paginatedData = filtered.slice(start, end);

            // Update UI
            this.allRequests = paginatedData;
            this.renderTable(paginatedData);
            this.renderPagination();
            this.updateKPIs(mockData);
            this.updateActiveFilters();

        } catch (error) {
            console.error('Error loading requests:', error);
            this.showError();
        }
    }

    getMockData() {
        // Mock data - Replace with API call
        return [
            {
                id: 'REQ-2024-0123',
                created_at: '2024-01-20T10:30:00Z',
                site_id: 'long_an',
                site_name: 'Long An',
                type: 'visitor',
                status: 'pending',
                requester: { name: 'John Doe', position: 'Sales Manager' },
                subject: { name: 'Sarah Connor', company: 'Cyberdyne Systems' },
                scheduled_at: '2024-01-25T14:00:00Z'
            },
            {
                id: 'REQ-2024-0124',
                created_at: '2024-01-20T09:15:00Z',
                site_id: 'tay_ninh',
                site_name: 'Tay Ninh',
                type: 'contractor',
                status: 'approved',
                requester: { name: 'Jane Smith', position: 'HR Manager' },
                subject: { name: 'ABC Construction', company: 'Electrical Work' },
                scheduled_at: '2024-01-22T08:00:00Z'
            },
            {
                id: 'REQ-2024-0125',
                created_at: '2024-01-19T14:20:00Z',
                site_id: 'long_an',
                site_name: 'Long An',
                type: 'goods',
                status: 'rejected',
                requester: { name: 'Admin User', position: 'Operations' },
                subject: { name: 'Raw Materials', company: 'Inbound' },
                scheduled_at: '2024-01-21T10:00:00Z'
            },
            {
                id: 'REQ-2024-0126',
                created_at: '2024-01-20T11:45:00Z',
                site_id: 'phan_thiet',
                site_name: 'Phan Thiet',
                type: 'tools',
                status: 'checked_in',
                requester: { name: 'IT Support', position: 'IT Department' },
                subject: { name: 'Laptop Dell XPS', company: 'Maintenance' },
                scheduled_at: '2024-01-20T12:00:00Z'
            },
            {
                id: 'REQ-2024-0127',
                created_at: '2024-01-20T08:00:00Z',
                site_id: 'long_an',
                site_name: 'Long An',
                type: 'visitor',
                status: 'approved',
                requester: { name: 'Marketing Team', position: 'Marketing' },
                subject: { name: 'John Wick', company: 'Continental Hotel' },
                scheduled_at: '2024-01-23T15:30:00Z'
            }
        ];
    }

    applyFilters(data) {
        return data.filter(request => {
            // Search filter
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                const matchesSearch =
                    request.id.toLowerCase().includes(searchLower) ||
                    request.subject.name.toLowerCase().includes(searchLower) ||
                    request.subject.company.toLowerCase().includes(searchLower) ||
                    request.requester.name.toLowerCase().includes(searchLower);

                if (!matchesSearch) return false;
            }

            // Site filter
            if (this.filters.site !== 'all' && request.site_id !== this.filters.site) {
                return false;
            }

            // Type filter
            if (this.filters.type !== 'all' && request.type !== this.filters.type) {
                return false;
            }

            // Status filter
            if (this.filters.status !== 'all' && request.status !== this.filters.status) {
                return false;
            }

            // Date range filter
            const createdDate = new Date(request.created_at).toISOString().split('T')[0];
            if (this.filters.from && createdDate < this.filters.from) {
                return false;
            }
            if (this.filters.to && createdDate > this.filters.to) {
                return false;
            }

            return true;
        });
    }

    applySorting(data) {
        return data.sort((a, b) => {
            let aVal, bVal;

            switch (this.sortBy) {
                case 'id':
                    aVal = a.id;
                    bVal = b.id;
                    break;
                case 'created':
                    aVal = new Date(a.created_at);
                    bVal = new Date(b.created_at);
                    break;
                case 'scheduled':
                    aVal = new Date(a.scheduled_at);
                    bVal = new Date(b.scheduled_at);
                    break;
                default:
                    return 0;
            }

            if (this.sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    renderTable(requests) {
        const tbody = document.getElementById('table-body');
        const loadingState = document.getElementById('loading-state');
        const emptyState = document.getElementById('empty-state');

        loadingState.classList.add('hidden');

        if (requests.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        tbody.innerHTML = requests.map(request => `
            <tr class="table-row-hover cursor-pointer transition-all border-l-4 border-transparent hover:border-l-primary" onclick="allRequestsPage.viewRequest('${request.id}')">
                <td class="px-4 py-4">
                    <span class="font-mono font-bold text-sm text-text-main dark:text-white">${request.id}</span>
                </td>
                <td class="px-4 py-4">
                    <div class="text-sm text-text-main dark:text-white">${this.formatDateTime(request.created_at)}</div>
                </td>
                <td class="px-4 py-4">
                    ${this.getSiteBadge(request.site_id, request.site_name)}
                </td>
                <td class="px-4 py-4">
                    ${this.getTypeBadge(request.type)}
                </td>
                <td class="px-4 py-4">
                    <div class="text-sm font-semibold text-text-main dark:text-white">${request.requester.name}</div>
                    <div class="text-xs text-text-sub">${request.requester.position}</div>
                </td>
                <td class="px-4 py-4">
                    <div class="text-sm font-semibold text-text-main dark:text-white truncate max-w-[200px]">${request.subject.name}</div>
                    <div class="text-xs text-text-sub truncate max-w-[200px]">${request.subject.company}</div>
                </td>
                <td class="px-4 py-4">
                    <div class="text-sm text-text-main dark:text-white">${this.formatDateTime(request.scheduled_at)}</div>
                </td>
                <td class="px-4 py-4">
                    ${this.getStatusChip(request.status)}
                </td>
                <td class="px-4 py-4 text-center">
                    <button onclick="event.stopPropagation(); allRequestsPage.viewRequest('${request.id}')" class="inline-flex items-center justify-center size-8 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                        <span class="material-symbols-outlined !text-lg">visibility</span>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    formatDateTime(isoString) {
        const date = new Date(isoString);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `${dateStr}, ${timeStr}`;
    }

    getSiteBadge(siteId, siteName) {
        const colors = {
            long_an: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
            tay_ninh: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
            phan_thiet: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
        };
        return `<span class="px-2.5 py-1 rounded-full text-xs font-bold ${colors[siteId] || 'bg-gray-100 text-gray-800'}">${siteName}</span>`;
    }

    getTypeBadge(type) {
        const config = {
            visitor: { icon: 'groups', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Visitor' },
            contractor: { icon: 'engineering', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', label: 'Contractor' },
            goods: { icon: 'local_shipping', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'Goods' },
            tools: { icon: 'construction', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Tools' }
        };
        const t = config[type] || config.visitor;
        return `
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${t.bg}">
                <span class="material-symbols-outlined !text-base ${t.color}">${t.icon}</span>
                <span class="text-xs font-semibold ${t.color}">${t.label}</span>
            </div>
        `;
    }

    getStatusChip(status) {
        const config = {
            pending: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', label: 'Pending' },
            approved: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', label: 'Approved' },
            rejected: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', label: 'Rejected' },
            checked_in: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', label: 'Checked In' },
            checked_out: { bg: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300', label: 'Checked Out' }
        };
        const s = config[status] || config.pending;
        return `<span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase ${s.bg}">${s.label}</span>`;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.totalCount / this.perPage);
        const start = (this.currentPage - 1) * this.perPage + 1;
        const end = Math.min(this.currentPage * this.perPage, this.totalCount);

        document.getElementById('page-start').textContent = start;
        document.getElementById('page-end').textContent = end;
        document.getElementById('total-count').textContent = this.totalCount;

        const buttonsContainer = document.getElementById('pagination-buttons');
        const buttons = [];

        // Previous button
        buttons.push(`
            <button ${this.currentPage === 1 ? 'disabled' : ''} 
                onclick="allRequestsPage.goToPage(${this.currentPage - 1})"
                class="px-3 py-1.5 rounded-lg border border-border-color text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
            </button>
        `);

        // Page numbers
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            const isActive = i === this.currentPage;
            buttons.push(`
                <button onclick="allRequestsPage.goToPage(${i})"
                    class="px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${isActive ? 'bg-primary text-white border-primary' : 'border-border-color hover:bg-gray-50 dark:hover:bg-gray-800'}">
                    ${i}
                </button>
            `);
        }

        if (totalPages > 5) {
            buttons.push(`<span class="px-2 text-text-sub">...</span>`);
        }

        // Next button
        buttons.push(`
            <button ${this.currentPage === totalPages ? 'disabled' : ''} 
                onclick="allRequestsPage.goToPage(${this.currentPage + 1})"
                class="px-3 py-1.5 rounded-lg border border-border-color text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Next
            </button>
        `);

        buttonsContainer.innerHTML = buttons.join('');
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.totalCount / this.perPage);
        if (page < 1 || page > totalPages) return;

        this.currentPage = page;
        this.loadRequests();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateKPIs(allData) {
        const today = new Date().toISOString().split('T')[0];
        const todayCount = allData.filter(r => r.created_at.split('T')[0] === today).length;
        const pendingCount = allData.filter(r => r.status === 'pending').length;
        const approvedCount = allData.filter(r => r.status === 'approved').length;
        const rejectedCount = allData.filter(r => r.status === 'rejected').length;

        document.getElementById('kpi-today').textContent = todayCount;
        document.getElementById('kpi-pending').textContent = pendingCount;
        document.getElementById('kpi-approved').textContent = approvedCount;
        document.getElementById('kpi-rejected').textContent = rejectedCount;
    }

    showLoading() {
        document.getElementById('table-body').innerHTML = '';
        document.getElementById('loading-state').classList.remove('hidden');
        document.getElementById('empty-state').classList.add('hidden');
    }

    showError() {
        document.getElementById('table-body').innerHTML = `
            <tr>
                <td colspan="9" class="px-4 py-16 text-center">
                    <div class="inline-flex items-center justify-center size-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                        <span class="material-symbols-outlined !text-4xl">warning</span>
                    </div>
                    <h3 class="text-lg font-bold text-text-main dark:text-white mb-2">Failed to load requests</h3>
                    <p class="text-sm text-text-sub dark:text-gray-400 mb-4">Unable to connect to server. Please try again.</p>
                    <button onclick="allRequestsPage.loadRequests()" class="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                        Retry
                    </button>
                </td>
            </tr>
        `;
        document.getElementById('loading-state').classList.add('hidden');
    }

    viewRequest(id) {
        console.log('View request:', id);
        // Use the existing modal from user-profile
        if (window.userProfile) {
            window.userProfile.viewRequestDetail(id);
        } else {
            alert(`View details for ${id}\n\n(Request detail modal will open here)`);
        }
    }

    exportData() {
        console.log('Exporting data...');
        // Implement CSV export
        const csv = this.generateCSV();
        this.downloadCSV(csv, `requests-export-${new Date().toISOString().split('T')[0]}.csv`);
    }

    generateCSV() {
        const headers = ['Request ID', 'Created', 'Site', 'Type', 'Requester', 'Subject', 'Scheduled', 'Status'];
        const rows = this.allRequests.map(r => [
            r.id,
            this.formatDateTime(r.created_at),
            r.site_name,
            r.type,
            r.requester.name,
            r.subject.name,
            this.formatDateTime(r.scheduled_at),
            r.status
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Initialize on DOM ready
let allRequestsPage;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        allRequestsPage = new AllRequestsPage();
    });
} else {
    allRequestsPage = new AllRequestsPage();
}
