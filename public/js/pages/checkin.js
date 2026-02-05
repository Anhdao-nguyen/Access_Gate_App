/**
 * Check-in Console Page Script
 * Handles visitor search, queue display, and check-in/out operations
 */

// State management
let currentTab = 'expected'; // 'expected', 'checkedin', 'history'
let selectedVisitor = null;
let selectedRequest = null;
const gateId = 1; // Current gate (using ID 1 from database 'Cổng Chính')

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Check-in console loaded, initializing...');

    // Hide detail panel initially (will show when visitor is selected)
    hideDetailPanel();

    // Initialize tabs
    initializeTabs();

    // Initialize search
    initializeSearch();

    // Initialize action buttons
    initializeActions();

    // Load initial data
    await loadQueueData();

    // Refresh data every 15 seconds
    setInterval(() => {
        if (currentTab === 'expected') loadQueueData();
        else if (currentTab === 'checkedin') loadCheckedInData();
    }, 15000);
});

/**
 * Hide the detail panel (used on init before data loads)
 */
function hideDetailPanel() {
    const main = document.querySelector('main');
    if (main) {
        const detailPanels = main.querySelectorAll('.bg-white.dark\\:bg-slate-900, .bg-green-100, .sticky.bottom-0');
        detailPanels.forEach(panel => {
            panel.style.display = 'none';
        });
    }
}

/**
 * Show the detail panel (when visitor data is loaded)
 */
function showDetailPanel() {
    const main = document.querySelector('main');
    if (main) {
        const detailPanels = main.querySelectorAll('.bg-white.dark\\:bg-slate-900, .bg-green-100, .sticky.bottom-0');
        detailPanels.forEach(panel => {
            panel.style.display = '';
        });
    }
}

/**
 * Initialize tab switching
 */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('[data-tab]');

    // If data attributes not set, use button text to identify tabs
    const tabContainer = document.querySelector('.flex.border-b-2.border-slate-200');
    if (tabContainer) {
        const buttons = tabContainer.querySelectorAll('button');
        buttons.forEach((btn, index) => {
            const tabs = ['expected', 'checkedin', 'history'];
            btn.dataset.tab = tabs[index];

            btn.addEventListener('click', () => {
                currentTab = tabs[index];
                updateTabUI(btn, buttons);
                loadTabData();
            });
        });
    }
}

/**
 * Update tab UI state
 */
function updateTabUI(activeBtn, allButtons) {
    allButtons.forEach(btn => {
        btn.classList.remove('border-primary', 'text-primary', 'bg-primary/10', 'dark:bg-primary/20');
        btn.classList.add('border-transparent', 'text-slate-500');
    });

    activeBtn.classList.remove('border-transparent', 'text-slate-500');
    activeBtn.classList.add('border-primary', 'text-primary', 'bg-primary/10', 'dark:bg-primary/20');
}

/**
 * Load data based on current tab
 */
async function loadTabData() {
    switch (currentTab) {
        case 'expected':
            await loadQueueData();
            break;
        case 'checkedin':
            await loadCheckedInData();
            break;
        case 'history':
            await loadHistoryData();
            break;
    }
}

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchInput = document.querySelector('input[placeholder*="QR"]');
    if (searchInput) {
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();

            if (query.length >= 2) {
                searchTimeout = setTimeout(() => searchVisitors(query), 300);
            } else if (query.length === 0) {
                loadTabData();
            }
        });
    }
}

/**
 * Search visitors
 */
async function searchVisitors(query) {
    try {
        const result = await GateAPI.Gate.search(gateId, query);

        if (result.success) {
            renderVisitorList(result.data, 'search');
        }
    } catch (error) {
        console.error('Search failed:', error);
    }
}

/**
 * Load expected visitors queue
 */
async function loadQueueData() {
    try {
        const result = await GateAPI.Gate.getQueue(gateId);

        if (result.success) {
            renderVisitorList(result.data, 'expected');
            updateTabCount('expected', result.count);
        }
    } catch (error) {
        console.error('Failed to load queue:', error);
    }
}

/**
 * Load checked-in visitors
 */
async function loadCheckedInData() {
    try {
        const result = await GateAPI.Gate.getCheckedIn(gateId);

        if (result.success) {
            renderVisitorList(result.data, 'checkedin');
            updateTabCount('checkedin', result.count);
        }
    } catch (error) {
        console.error('Failed to load checked-in visitors:', error);
    }
}

/**
 * Load access history
 */
async function loadHistoryData() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const result = await GateAPI.Gate.getLogs(gateId, { date: today, limit: 50 });

        if (result.success) {
            renderHistoryList(result.data);
        }
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

/**
 * Update tab count display
 */
function updateTabCount(tab, count) {
    const tabContainer = document.querySelector('.flex.border-b-2.border-slate-200');
    if (tabContainer) {
        const buttons = tabContainer.querySelectorAll('button');
        const tabIndex = { expected: 0, checkedin: 1, history: 2 }[tab];
        const btn = buttons[tabIndex];
        if (btn) {
            const text = btn.querySelector('p');
            const labels = { expected: 'Ready', checkedin: 'Onsite', history: 'History' };
            text.textContent = `${labels[tab]} (${count || 0})`;
        }
    }
}

/**
 * Render visitor list
 */
function renderVisitorList(requests, type) {
    const container = document.getElementById('visitor-list-container');
    if (!container) return;

    if (!requests || requests.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <span class="material-symbols-outlined text-5xl mb-3">person_search</span>
                <p class="font-semibold">No visitors found</p>
            </div>
        `;
        return;
    }

    let html = '';

    requests.forEach((request, reqIndex) => {
        request.visitors.forEach((visitor, visIndex) => {
            const isSelected = selectedVisitor?.id === visitor.id;
            const isFirst = reqIndex === 0 && visIndex === 0;

            html += renderVisitorCard(request, visitor, type, isSelected || isFirst);
        });
    });

    container.innerHTML = `<div class="space-y-3">${html}</div>`;

    // Add click handlers
    container.querySelectorAll('[data-visitor-card]').forEach(card => {
        card.addEventListener('click', () => {
            const requestId = card.dataset.requestId;
            const visitorId = card.dataset.visitorId;
            selectVisitor(requestId, visitorId, requests);
        });
    });

    // Auto-select first visitor if none selected
    if (!selectedVisitor && requests.length > 0 && requests[0].visitors.length > 0) {
        selectVisitor(requests[0].id, requests[0].visitors[0].id, requests);
    }
}

/**
 * Render single visitor card
 */
function renderVisitorCard(request, visitor, type, isSelected) {
    const statusConfig = {
        expected: { bg: 'bg-blue-600', text: 'text-white', label: 'Ready' },
        checkedin: { bg: 'bg-green-600', text: 'text-white', label: 'On Site' },
        pending: { bg: 'bg-orange-100 text-orange-700', text: '', label: 'Pending' }
    };

    const status = visitor.checkedIn ? 'checkedin' : (type === 'expected' ? 'expected' : 'pending');
    const config = statusConfig[status];

    const selectedClass = isSelected
        ? 'border-2 border-primary shadow-md transform scale-[1.01]'
        : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700';

    const time = request.scheduledTime || '';
    const checkInTime = visitor.checkInTime
        ? new Date(visitor.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '';

    return `
        <div class="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 ${selectedClass} cursor-pointer transition-all shadow-sm hover:shadow-md group"
             data-visitor-card
             data-request-id="${request.id}"
             data-visitor-id="${visitor.id}">
            ${isSelected ? `
                <div class="absolute right-3 top-3">
                    <span class="flex size-3 relative">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full size-3 bg-blue-500"></span>
                    </span>
                </div>
            ` : ''}
            <div class="flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl size-16 flex-shrink-0 border border-slate-100 dark:border-slate-700">
                <span class="material-symbols-outlined text-[32px]">person</span>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-1.5">
                    <h3 class="text-slate-800 dark:text-slate-200 font-bold text-lg truncate group-hover:text-primary transition-colors">
                        ${visitor.fullName}
                    </h3>
                    <span class="${config.bg} ${config.text} text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wide">
                        ${config.label}
                    </span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        ${visitor.checkedIn ? `Checked in at ${checkInTime}` : time}
                    </span>
                </div>
                <p class="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase truncate">
                    ${visitor.company}
                </p>
            </div>
        </div>
    `;
}

/**
 * Render history list
 */
function renderHistoryList(logs) {
    const container = document.getElementById('visitor-list-container');
    if (!container) return;

    if (!logs || logs.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <span class="material-symbols-outlined text-5xl mb-3">history</span>
                <p class="font-semibold">No history for today</p>
            </div>
        `;
        return;
    }

    const html = logs.map(log => {
        const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const isCheckIn = log.action === 'checkin';
        const icon = isCheckIn ? 'login' : 'logout';
        const color = isCheckIn ? 'text-blue-600' : 'text-green-600';

        return `
            <div class="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-center ${isCheckIn ? 'bg-blue-100' : 'bg-green-100'} rounded-xl size-12 flex-shrink-0">
                    <span class="material-symbols-outlined ${color} text-[24px]">${icon}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-slate-800 dark:text-slate-200 font-bold truncate">${log.visitorName}</h3>
                    <p class="text-slate-500 text-sm">${log.company} • ${time}</p>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `<div class="space-y-3">${html}</div>`;
}

/**
 * Select a visitor for check-in
 */
function selectVisitor(requestId, visitorId, requests) {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const visitor = request.visitors.find(v => v.id === visitorId);
    if (!visitor) return;

    selectedRequest = request;
    selectedVisitor = visitor;

    // Update detail panel
    updateDetailPanel(request, visitor);

    // Re-render list to show selection
    // renderVisitorList handled by caller
}

/**
 * Update the detail panel with selected visitor info
 */
function updateDetailPanel(request, visitor) {
    // Show the detail panel (it was hidden on init)
    showDetailPanel();

    // Update name
    const nameEl = document.querySelector('.text-3xl.font-extrabold');
    if (nameEl) nameEl.textContent = visitor.fullName;

    // Update company
    const companyEl = document.querySelector('.text-xl.font-bold.text-slate-700');
    if (companyEl) companyEl.textContent = visitor.company;

    // Update ID Card - show full number for verification
    const idEl = document.querySelector('.text-2xl.font-mono.font-bold');
    if (idEl) idEl.textContent = visitor.idCard || 'N/A';

    // Update phone - find all detail value elements and update the correct ones
    const detailGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    if (detailGrid) {
        const detailDivs = detailGrid.querySelectorAll('div');

        // Phone number (usually 2nd item after company)
        const phoneLabel = Array.from(detailDivs).find(div =>
            div.querySelector('label')?.textContent.includes('Phone')
        );
        if (phoneLabel) {
            const phoneP = phoneLabel.querySelector('p.text-xl');
            if (phoneP) phoneP.textContent = visitor.phone || 'N/A';
        }

        // Access Area
        const accessLabel = Array.from(detailDivs).find(div =>
            div.querySelector('label')?.textContent.includes('Access')
        );
        if (accessLabel) {
            const accessP = accessLabel.querySelector('p');
            if (accessP) accessP.textContent = request.accessArea || 'N/A';
        }

        // Vehicle Plate
        const vehicleLabel = Array.from(detailDivs).find(div =>
            div.querySelector('label')?.textContent.includes('Vehicle')
        );
        if (vehicleLabel) {
            const vehicleP = vehicleLabel.querySelector('p');
            if (vehicleP) vehicleP.textContent = request.vehiclePlate || 'N/A';
        }
    }

    // Safety Equipment
    const safetyBadges = [];
    if (visitor.requirePPE?.hairnet || visitor.ppeHairnet) {
        safetyBadges.push('<span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">Hairnet</span>');
    }
    if (visitor.requirePPE?.safetyShoes || visitor.ppeSafetyShoes) {
        safetyBadges.push('<span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">Safety Shoes</span>');
    }
    if (visitor.shoeSize) {
        safetyBadges.push(`<span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-bold">Size ${visitor.shoeSize}</span>`);
    }

    const safetyEl = document.querySelector('.flex.flex-wrap.gap-2');
    if (safetyEl) {
        safetyEl.innerHTML = safetyBadges.length > 0
            ? safetyBadges.join('')
            : '<span class="text-slate-500 text-sm">No PPE required</span>';
    }

    // Update host info
    if (request.host) {
        const hostNameEl = document.querySelector('.text-lg.font-bold.text-slate-900');
        if (hostNameEl) hostNameEl.textContent = request.host.name || 'N/A';
    }

    // Update appointment ID
    const appointmentEl = document.querySelector('.text-2xl.font-mono.font-black');
    if (appointmentEl) appointmentEl.textContent = `#${request.id.slice(-6)}`;

    // Update Additional Info fields with request data
    const assetsInput = document.getElementById('assets-input');
    if (assetsInput) {
        assetsInput.value = request.assets || '';
    }

    const vehicleInput = document.getElementById('vehicle-input');
    if (vehicleInput) {
        vehicleInput.value = request.vehiclePlate || request.vehicle || '';
    }

    const guardNotesInput = document.getElementById('guard-notes-input');
    if (guardNotesInput) {
        guardNotesInput.value = request.notes || '';
    }

    // Update status banner
    updateStatusBanner(visitor.checkedIn);
}

/**
 * Update status banner
 */
function updateStatusBanner(isCheckedIn) {
    const banner = document.querySelector('.w-full.bg-green-100, .w-full.bg-blue-100');
    if (!banner) return;

    if (isCheckedIn) {
        banner.className = banner.className.replace('bg-green-100', 'bg-blue-100').replace('border-green-500', 'border-blue-500');
        const title = banner.querySelector('h3');
        const desc = banner.querySelector('p');
        if (title) title.textContent = 'CURRENTLY ON SITE';
        if (desc) desc.textContent = 'Visitor is checked in. Ready for check-out.';
    }
}

/**
 * Initialize action buttons
 */
function initializeActions() {
    const buttons = document.querySelectorAll('button');

    buttons.forEach(btn => {
        const text = btn.textContent.trim().toUpperCase();

        if (text.includes('CONFIRM CHECK-IN')) {
            btn.addEventListener('click', handleCheckIn);
        } else if (text.includes('DENY ENTRY')) {
            btn.addEventListener('click', handleDenyEntry);
        }
    });
}

/**
 * Handle check-in action
 */
async function handleCheckIn() {
    if (!selectedRequest || !selectedVisitor) {
        GateAPI.showToast('Please select a visitor first', 'warning');
        return;
    }

    if (selectedVisitor.checkedIn) {
        // If already checked in, perform check-out
        await handleCheckOut();
        return;
    }

    // Get data from Additional Info fields
    const assets = document.getElementById('assets-input')?.value || '';
    const vehicle = document.getElementById('vehicle-input')?.value || '';
    const notes = document.getElementById('guard-notes-input')?.value || '';

    try {
        const result = await GateAPI.Gate.checkIn(gateId, {
            requestId: selectedRequest.id,
            visitorId: selectedVisitor.id,
            assets,
            vehiclePlate: vehicle,
            notes
        });

        if (result.success) {
            GateAPI.showToast(`${selectedVisitor.fullName} checked in successfully!`, 'success');
            selectedVisitor = null;
            selectedRequest = null;

            // Switch to Onsite tab and load checked-in visitors
            currentTab = 'checkedin';
            const tabContainer = document.querySelector('.flex.border-b-2.border-slate-200');
            if (tabContainer) {
                const buttons = tabContainer.querySelectorAll('button');
                updateTabUI(buttons[1], buttons); // Switch to 2nd tab (Onsite)
            }
            await loadCheckedInData();
        }
    } catch (error) {
        GateAPI.showToast(`Check-in failed: ${error.message}`, 'error');
    }
}

/**
 * Handle check-out action
 */
async function handleCheckOut() {
    if (!selectedRequest || !selectedVisitor) return;

    const notes = document.querySelector('textarea')?.value || '';

    try {
        const result = await GateAPI.Gate.checkOut(gateId, {
            requestId: selectedRequest.id,
            visitorId: selectedVisitor.id,
            notes
        });

        if (result.success) {
            GateAPI.showToast(`${selectedVisitor.fullName} checked out successfully!`, 'success');
            selectedVisitor = null;
            selectedRequest = null;
            await loadCheckedInData();
        }
    } catch (error) {
        GateAPI.showToast(`Check-out failed: ${error.message}`, 'error');
    }
}

/**
 * Handle deny entry
 */
function handleDenyEntry() {
    if (!selectedVisitor) {
        GateAPI.showToast('Please select a visitor first', 'warning');
        return;
    }

    const reason = prompt('Please provide a reason for denying entry:');
    if (reason) {
        GateAPI.showToast('Entry denied. Visitor notified.', 'warning');
        selectedVisitor = null;
        loadQueueData();
    }
}

// Expose for debugging
window.checkinState = {
    getCurrentTab: () => currentTab,
    getSelectedVisitor: () => selectedVisitor,
    getSelectedRequest: () => selectedRequest
};
