/**
 * Home Page (Dashboard) Script
 * Loads dashboard statistics and recent activity from API
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Home page loaded, initializing...');

    // Load dashboard data
    await loadDashboardData();

    // Refresh data every 30 seconds
    setInterval(loadDashboardData, 30000);
});

/**
 * Load dashboard statistics and recent activity
 */
async function loadDashboardData() {
    try {
        const result = await GateAPI.Dashboard.getStats();

        if (result.success) {
            updateStats(result.data.stats);
            updateRecentActivity(result.data.recentActivity);
            updateOverstayAlerts(result.data.overstayAlerts);
        }
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

/**
 * Update statistics display
 */
function updateStats(stats) {
    // Update visitors on site count
    const visitorsOnSiteEl = document.querySelector('[data-stat="visitors-on-site"]');
    if (visitorsOnSiteEl) {
        visitorsOnSiteEl.textContent = stats.onSite || 0;
    }

    // Update overstay alerts count
    const overstayEl = document.querySelector('[data-stat="overstay-alerts"]');
    if (overstayEl) {
        overstayEl.textContent = stats.overstayAlerts || 0;
    }

    // Also update the static elements if they exist
    const statsCards = document.querySelectorAll('.text-4xl.font-bold');
    if (statsCards.length >= 2) {
        statsCards[0].textContent = stats.onSite || 0;
        // statsCards[1] is for overstay - will be updated from overstayAlerts
    }
}

/**
 * Update recent activity list
 */
function updateRecentActivity(activities) {
    const container = document.querySelector('[data-activity-list]');
    if (!container) {
        // Find the activity container by structure if data attribute not set
        const activityContainer = document.querySelector('.divide-y.divide-\\[\\#f1f3e7\\]');
        if (activityContainer && activities && activities.length > 0) {
            activityContainer.innerHTML = activities.map(activity => renderActivityItem(activity)).join('');
        }
        return;
    }

    if (!activities || activities.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-slate-500">
                <span class="material-symbols-outlined text-4xl mb-2">history</span>
                <p>No recent activity</p>
            </div>
        `;
        return;
    }

    container.innerHTML = activities.map(activity => renderActivityItem(activity)).join('');
}

/**
 * Render a single activity item
 */
function renderActivityItem(activity) {
    const isCheckIn = activity.action === 'checkin';

    // Match styles with all-requests.js
    // Check In: Blue, Check Out: Gray (Completed)
    const iconBg = isCheckIn ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-900/30';
    const iconColor = isCheckIn ? 'text-blue-600 dark:text-blue-500' : 'text-gray-600 dark:text-gray-500';
    const icon = isCheckIn ? 'login' : 'logout';

    const statusBg = isCheckIn ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-900/40';
    const statusText = isCheckIn ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800 dark:text-gray-200';
    const statusLabel = isCheckIn ? 'CHECKED IN' : 'COMPLETED';

    const time = new Date(activity.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const initials = getInitials(activity.visitorName);

    return `
        <div class="group flex items-center gap-5 px-5 lg:px-6 py-5 hover:bg-[#fbfcf8] dark:hover:bg-[#363d21] transition-colors cursor-pointer">
            <div class="shrink-0 relative">
                <div class="flex items-center justify-center h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-lg select-none">
                    ${initials}
                </div>
                <div class="absolute -bottom-1 -right-1 bg-white dark:bg-[#2c321a] rounded-full p-1">
                    <div class="${iconBg} rounded-full p-0.5 flex items-center justify-center">
                        <span class="material-symbols-outlined ${iconColor} !text-sm">${icon}</span>
                    </div>
                </div>
            </div>
            <div class="flex flex-col flex-1 min-w-0 gap-1">
                <div class="flex items-baseline justify-between gap-2">
                    <p class="text-base font-bold truncate text-text-primary-light dark:text-text-primary-dark">
                        ${activity.visitorName}
                    </p>
                    <span class="text-xs font-bold px-2.5 py-1 rounded-full ${statusBg} ${statusText}">${statusLabel}</span>
                </div>
                <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm truncate font-medium">
                    ${activity.company} • ${activity.gateName} • ${time}
                </p>
            </div>
            <div class="shrink-0 text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary transition-colors">
                <span class="material-symbols-outlined !text-2xl">chevron_right</span>
            </div>
        </div>
    `;
}

/**
 * Get initials from name
 */
function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

/**
 * Update overstay alerts display
 */
function updateOverstayAlerts(alerts) {
    const statsCards = document.querySelectorAll('.text-4xl.font-bold');
    if (statsCards.length >= 2) {
        statsCards[1].textContent = alerts ? alerts.length : 0;
    }
}

// Expose function for manual refresh
window.refreshDashboard = loadDashboardData;
