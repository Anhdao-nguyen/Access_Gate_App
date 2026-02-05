/**
 * All Requests Page Script
 * Handles request listing, filtering, and management
 */

// State management
let currentFilters = {
    status: '',
    type: '',
    search: '',
    page: 1,
    limit: 20
};
let allRequests = [];

document.addEventListener('DOMContentLoaded', async () => {
    console.log('All requests page loaded, initializing...');

    // Initialize filters
    initializeFilters();

    // Initialize table actions
    initializeTableActions();

    // Load initial data
    await loadRequests();

    // Load stats
    await loadStats();
});

/**
 * Initialize filter controls
 */
function initializeFilters() {
    // Search input
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = e.target.value;
                currentFilters.page = 1;
                loadRequests();
            }, 300);
        });
    }

    // Status filter
    const statusSelect = document.querySelector('[name="status"], [data-filter="status"]');
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            currentFilters.status = e.target.value;
            currentFilters.page = 1;
            loadRequests();
        });
    }

    // Type filter
    const typeSelect = document.querySelector('[name="type"], [data-filter="type"]');
    if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
            currentFilters.type = e.target.value;
            currentFilters.page = 1;
            loadRequests();
        });
    }

    // Date filter
    const dateInput = document.querySelector('input[type="date"], [data-filter="date"]');
    if (dateInput) {
        dateInput.addEventListener('change', (e) => {
            currentFilters.date = e.target.value;
            currentFilters.page = 1;
            loadRequests();
        });
    }

    // Clear filters button
    const clearBtn = document.querySelector('[data-clear-filters]');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }
}

/**
 * Clear all filters
 */
function clearFilters() {
    currentFilters = { status: '', type: '', search: '', page: 1, limit: 20 };

    // Reset form inputs
    document.querySelectorAll('input[type="search"], input[type="text"]').forEach(el => el.value = '');
    document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);

    loadRequests();
}

/**
 * Load statistics
 */
async function loadStats() {
    try {
        const result = await GateAPI.Visitor.getStats();

        if (result.success) {
            updateStatsDisplay(result.data);
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

/**
 * Update stats cards display
 */
function updateStatsDisplay(stats) {
    const statCards = document.querySelectorAll('[data-stat]');

    statCards.forEach(card => {
        const statType = card.dataset.stat;
        const valueEl = card.querySelector('.text-2xl, .text-3xl, .font-bold');

        if (valueEl && stats[statType] !== undefined) {
            valueEl.textContent = stats[statType];
        }
    });

    // Also try to update by position if data attributes not set
    const cards = document.querySelectorAll('.bg-white.rounded-xl, .stat-card');
    if (cards.length >= 4) {
        const values = [stats.today, stats.pending, stats.approved, stats.rejected];
        cards.forEach((card, index) => {
            const numEl = card.querySelector('.text-2xl, .text-3xl');
            if (numEl && values[index] !== undefined) {
                numEl.textContent = values[index];
            }
        });
    }
}

/**
 * Load requests from API
 */
async function loadRequests() {
    try {
        showTableLoading(true);

        const result = await GateAPI.Visitor.getAll(currentFilters);

        if (result.success) {
            allRequests = result.data;
            renderTable(result.data);
            renderPagination(result.pagination);
        }
    } catch (error) {
        console.error('Failed to load requests:', error);
        showTableError(error.message);
    } finally {
        showTableLoading(false);
    }
}

/**
 * Render requests table
 */
function renderTable(requests) {
    const tbody = document.querySelector('tbody, [data-table-body]');
    if (!tbody) return;

    if (!requests || requests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-12 text-center text-slate-500">
                    <span class="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                    No requests found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = requests.map(request => renderTableRow(request)).join('');

    // Add row click handlers
    tbody.querySelectorAll('tr[data-request-id]').forEach(row => {
        row.addEventListener('click', () => {
            const requestId = row.dataset.requestId;
            showRequestDetail(requestId);
        });
    });
}

/**
 * Render single table row
 */
function renderTableRow(request) {
    const statusBadge = getStatusBadgeHTML(request.status);
    const typeBadge = getTypeBadgeHTML(request.type);

    const createdDate = new Date(request.createdAt).toLocaleDateString('vi-VN');
    const scheduledDate = new Date(request.scheduledDate).toLocaleDateString('vi-VN');
    const scheduledTime = request.scheduledTime;

    const visitorNames = request.visitors.map(v => v.fullName).join(', ');
    const visitorCount = request.visitors.length;

    return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-200 dark:border-slate-700"
            data-request-id="${request.id}">
            <td class="px-4 py-4">
                <span class="font-mono text-sm font-semibold text-primary">${request.id}</span>
            </td>
            <td class="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">${createdDate}</td>
            <td class="px-4 py-4">${typeBadge}</td>
            <td class="px-4 py-4">
                <div class="max-w-[200px]">
                    <p class="font-semibold text-slate-900 dark:text-white truncate">${visitorNames}</p>
                    <p class="text-xs text-slate-500">${visitorCount} visitor(s)</p>
                </div>
            </td>
            <td class="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                ${scheduledDate} ${scheduledTime}
            </td>
            <td class="px-4 py-4">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">${request.host?.name || 'N/A'}</p>
                <p class="text-xs text-slate-500">${request.host?.department || ''}</p>
            </td>
            <td class="px-4 py-4">${statusBadge}</td>
            <td class="px-4 py-4">
                <div class="flex items-center gap-1">
                    ${request.status === 'submitted' || request.status === 'manager_approved' ? `
                        <button class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                onclick="event.stopPropagation(); approveRequest('${request.id}')"
                                title="Approve">
                            <span class="material-symbols-outlined text-[20px]">check_circle</span>
                        </button>
                        <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                onclick="event.stopPropagation(); rejectRequest('${request.id}')"
                                title="Reject">
                            <span class="material-symbols-outlined text-[20px]">cancel</span>
                        </button>
                    ` : ''}
                    <button class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            onclick="event.stopPropagation(); showRequestDetail('${request.id}')"
                            title="View Details">
                        <span class="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Get status badge HTML
 */
function getStatusBadgeHTML(status) {
    const config = {
        submitted: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'SUBMITTED' },
        manager_approved: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'MANAGER APPROVED' },
        plant_manager_approved: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'PLANT MGR APPROVED' },
        ready: { bg: 'bg-green-100', text: 'text-green-800', label: 'READY' },
        checked_in: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'CHECKED IN' },
        checked_out: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'COMPLETED' },
        rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'REJECTED' },
        cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'CANCELLED' },
        // Legacy support (in case old statuses still exist)
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'SUBMITTED' },
        approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'READY' }
    };

    const c = config[status] || config.submitted;
    return `<span class="px-2.5 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}">${c.label}</span>`;
}

/**
 * Get type badge HTML
 */
function getTypeBadgeHTML(type) {
    const config = {
        visitor: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Visitor' },
        contractor: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Contractor' },
        delivery: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Delivery' }
    };

    const c = config[type] || config.visitor;
    return `<span class="px-2.5 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}">${c.label}</span>`;
}

/**
 * Render pagination controls
 */
function renderPagination(pagination) {
    const container = document.querySelector('[data-pagination], .pagination');
    if (!container || !pagination) return;

    const { page, totalPages, total } = pagination;

    container.innerHTML = `
        <div class="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <p class="text-sm text-slate-600 dark:text-slate-400">
                Showing <span class="font-semibold">${(page - 1) * currentFilters.limit + 1}</span>
                to <span class="font-semibold">${Math.min(page * currentFilters.limit, total)}</span>
                of <span class="font-semibold">${total}</span> results
            </p>
            <div class="flex gap-2">
                <button class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium
                              ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}"
                        ${page <= 1 ? 'disabled' : ''}
                        onclick="goToPage(${page - 1})">
                    Previous
                </button>
                <button class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium
                              ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}"
                        ${page >= totalPages ? 'disabled' : ''}
                        onclick="goToPage(${page + 1})">
                    Next
                </button>
            </div>
        </div>
    `;
}

/**
 * Navigate to page
 */
function goToPage(page) {
    currentFilters.page = page;
    loadRequests();
}

/**
 * Show table loading state
 */
function showTableLoading(show) {
    const table = document.querySelector('table, [data-table]');
    if (table) {
        table.classList.toggle('opacity-50', show);
    }
}

/**
 * Show table error
 */
function showTableError(message) {
    const tbody = document.querySelector('tbody, [data-table-body]');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-12 text-center text-red-500">
                    <span class="material-symbols-outlined text-4xl mb-2 block">error</span>
                    Error: ${message}
                </td>
            </tr>
        `;
    }
}

/**
 * Initialize table actions
 */
function initializeTableActions() {
    // Export button
    const exportBtn = document.querySelector('[data-export]');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
}

/**
 * Approve request
 */
async function approveRequest(requestId) {
    if (!confirm('Are you sure you want to approve this request?')) return;

    try {
        const result = await GateAPI.Visitor.approve(requestId);

        if (result.success) {
            GateAPI.showToast('Request approved successfully', 'success');
            loadRequests();
            loadStats();
        }
    } catch (error) {
        GateAPI.showToast(`Failed to approve: ${error.message}`, 'error');
    }
}

/**
 * Reject request
 */
async function rejectRequest(requestId) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
        const result = await GateAPI.Visitor.reject(requestId, reason);

        if (result.success) {
            GateAPI.showToast('Request rejected', 'warning');
            loadRequests();
            loadStats();
        }
    } catch (error) {
        GateAPI.showToast(`Failed to reject: ${error.message}`, 'error');
    }
}

/**
 * Show request detail modal
 */
function showRequestDetail(requestId) {
    const request = allRequests.find(r => r.id === requestId);
    if (!request) return;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50';
    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto shadow-2xl">
            <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 class="text-xl font-bold">Request Details</h2>
                <button onclick="this.closest('.fixed').remove()" class="p-2 hover:bg-slate-100 rounded-lg">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="p-6 space-y-6">
                <div class="flex items-center justify-between">
                    <span class="font-mono text-lg font-bold text-primary">${request.id}</span>
                    ${getStatusBadgeHTML(request.status)}
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase">Purpose</label>
                        <p class="font-semibold capitalize">${request.purpose}</p>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase">Access Area</label>
                        <p class="font-semibold capitalize">${request.accessArea}</p>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase">Scheduled Date</label>
                        <p class="font-semibold">${request.scheduledDate} ${request.scheduledTime}</p>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase">Host</label>
                        <p class="font-semibold">${request.host?.name || 'N/A'}</p>
                        <p class="text-sm text-slate-500">${request.host?.department || ''}</p>
                    </div>
                </div>

                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase mb-2 block">Visitors (${request.visitors.length})</label>
                    <div class="space-y-2">
                        ${request.visitors.map(v => `
                            <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div class="size-10 rounded-full bg-slate-200 flex items-center justify-center">
                                    <span class="material-symbols-outlined text-slate-500">person</span>
                                </div>
                                <div>
                                    <p class="font-semibold">${v.fullName}</p>
                                    <p class="text-sm text-slate-500">${v.company} • ${v.phone}</p>
                                </div>
                                ${v.checkedIn ? '<span class="ml-auto text-green-600 text-sm font-bold">Checked In</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${request.notes ? `
                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase">Notes</label>
                        <p class="mt-1">${request.notes}</p>
                    </div>
                ` : ''}
            </div>
            <div class="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
                ${request.status === 'submitted' || request.status === 'manager_approved' ? `
                    <button onclick="approveRequest('${request.id}'); this.closest('.fixed').remove();"
                            class="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                        Approve
                    </button>
                    <button onclick="rejectRequest('${request.id}'); this.closest('.fixed').remove();"
                            class="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
                        Reject
                    </button>
                ` : ''}
                <button onclick="this.closest('.fixed').remove()"
                        class="px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50">
                    Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

/**
 * Export to CSV
 */
function exportToCSV() {
    if (!allRequests || allRequests.length === 0) {
        GateAPI.showToast('No data to export', 'warning');
        return;
    }

    const headers = ['Request ID', 'Type', 'Status', 'Visitors', 'Scheduled Date', 'Host', 'Created'];
    const rows = allRequests.map(r => [
        r.id,
        r.type,
        r.status,
        r.visitors.map(v => v.fullName).join('; '),
        `${r.scheduledDate} ${r.scheduledTime}`,
        r.host?.name || '',
        new Date(r.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `requests_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    GateAPI.showToast('Export completed', 'success');
}

// Expose functions globally for onclick handlers
window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;
window.showRequestDetail = showRequestDetail;
window.goToPage = goToPage;
window.exportToCSV = exportToCSV;
