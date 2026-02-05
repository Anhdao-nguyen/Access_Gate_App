/**
 * Create Request Page Script
 * Handles visitor request form submission
 */

// State management
let visitors = [];
let visitorCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Request page loaded, initializing...');

    // Initialize form
    initializeForm();

    // Initialize visitor management
    initializeVisitorManagement();

    // Initialize form submission
    initializeSubmission();
});

/**
 * Initialize form elements
 */
function initializeForm() {
    // Set default date to today
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Set default time
    const timeInput = document.querySelector('input[type="time"]');
    if (timeInput) {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        timeInput.value = now.toTimeString().slice(0, 5);
    }

    // Initialize PPE checkbox handling
    initializePPEHandling();
}

/**
 * Initialize PPE handling (shoe size visibility)
 */
function initializePPEHandling() {
    document.addEventListener('change', (e) => {
        if (e.target.matches('[data-ppe-shoes]')) {
            const shoeSelect = e.target.closest('.visitor-form')?.querySelector('[data-shoe-size]');
            if (shoeSelect) {
                shoeSelect.closest('.shoe-size-container').classList.toggle('hidden', !e.target.checked);
            }
        }
    });
}

/**
 * Initialize visitor management (add/remove visitors)
 */
function initializeVisitorManagement() {
    // Find add visitor button
    const addBtn = document.querySelector('[data-add-visitor]');
    if (addBtn) {
        addBtn.addEventListener('click', addVisitor);
    } else {
        // Try to find by text content
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.includes('Add Visitor') || btn.textContent.includes('Thêm khách')) {
                btn.addEventListener('click', addVisitor);
            }
        });
    }

    // Initialize first visitor form
    const visitorContainer = document.querySelector('[data-visitors-container]') ||
        document.querySelector('.visitor-forms-container');

    if (visitorContainer && visitorContainer.children.length === 0) {
        addVisitor();
    }
}

/**
 * Add a new visitor form
 */
function addVisitor() {
    visitorCount++;
    const index = visitorCount;

    const container = document.querySelector('[data-visitors-container]') ||
        document.querySelector('.visitor-forms-container') ||
        document.querySelector('.space-y-6');

    if (!container) {
        console.error('Visitor container not found');
        return;
    }

    const visitorForm = document.createElement('div');
    visitorForm.className = 'visitor-form bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 relative';
    visitorForm.dataset.visitorIndex = index;

    visitorForm.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h4 class="font-bold text-lg">Visitor #${index}</h4>
            ${index > 1 ? `
                <button type="button" class="remove-visitor text-red-500 hover:text-red-700 p-1" data-remove-visitor="${index}">
                    <span class="material-symbols-outlined">close</span>
                </button>
            ` : ''}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Full Name <span class="text-red-500">*</span>
                </label>
                <input type="text" name="visitor_${index}_name" required
                    class="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Nguyen Van A">
            </div>

            <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Company
                </label>
                <input type="text" name="visitor_${index}_company"
                    class="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="ABC Company">
            </div>

            <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    ID Card / Passport <span class="text-red-500">*</span>
                </label>
                <input type="text" name="visitor_${index}_idcard" required
                    class="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="079123456789">
            </div>

            <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number <span class="text-red-500">*</span>
                </label>
                <input type="tel" name="visitor_${index}_phone" required
                    class="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="0901234567">
            </div>

            <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email
                </label>
                <input type="email" name="visitor_${index}_email"
                    class="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="email@company.com">
            </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h5 class="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-3">PPE Requirements</h5>
            <div class="flex flex-wrap gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="visitor_${index}_hairnet" data-ppe-hairnet
                        class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20">
                    <span class="text-sm">Hairnet</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="visitor_${index}_shoes" data-ppe-shoes
                        class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20">
                    <span class="text-sm">Safety Shoes</span>
                </label>
                <div class="shoe-size-container hidden">
                    <select name="visitor_${index}_shoesize" data-shoe-size
                        class="h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm">
                        <option value="">Size...</option>
                        ${[38, 39, 40, 41, 42, 43, 44, 45].map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>
    `;

    container.appendChild(visitorForm);

    // Add remove handler
    const removeBtn = visitorForm.querySelector('[data-remove-visitor]');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => removeVisitor(index));
    }

    // Update visitor count display
    updateVisitorCountDisplay();
}

/**
 * Remove a visitor form
 */
function removeVisitor(index) {
    const form = document.querySelector(`[data-visitor-index="${index}"]`);
    if (form) {
        form.remove();
        updateVisitorCountDisplay();
    }
}

/**
 * Update visitor count display
 */
function updateVisitorCountDisplay() {
    const count = document.querySelectorAll('.visitor-form').length;
    const countEl = document.querySelector('[data-visitor-count]');
    if (countEl) {
        countEl.textContent = count;
    }
}

/**
 * Collect visitor data from forms
 */
function collectVisitorData() {
    const visitorForms = document.querySelectorAll('.visitor-form');
    const visitors = [];

    visitorForms.forEach(form => {
        const index = form.dataset.visitorIndex;

        const visitor = {
            fullName: form.querySelector(`[name="visitor_${index}_name"]`)?.value || '',
            company: form.querySelector(`[name="visitor_${index}_company"]`)?.value || '',
            idCard: form.querySelector(`[name="visitor_${index}_idcard"]`)?.value || '',
            phone: form.querySelector(`[name="visitor_${index}_phone"]`)?.value || '',
            email: form.querySelector(`[name="visitor_${index}_email"]`)?.value || '',
            requirePPE: {
                hairnet: form.querySelector(`[name="visitor_${index}_hairnet"]`)?.checked || false,
                safetyShoes: form.querySelector(`[name="visitor_${index}_shoes"]`)?.checked || false,
                shoeSize: form.querySelector(`[name="visitor_${index}_shoesize"]`)?.value || null
            }
        };

        if (visitor.fullName && visitor.idCard && visitor.phone) {
            visitors.push(visitor);
        }
    });

    return visitors;
}

/**
 * Initialize form submission
 */
function initializeSubmission() {
    const form = document.querySelector('form') || document.querySelector('[data-request-form]');
    const submitBtn = document.querySelector('[data-submit]') || document.querySelector('button[type="submit"]');

    // Find submit button by text
    if (!submitBtn) {
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.includes('Submit') || btn.textContent.includes('Gửi')) {
                btn.addEventListener('click', handleSubmit);
            }
        });
    } else {
        submitBtn.addEventListener('click', handleSubmit);
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSubmit();
        });
    }
}

/**
 * Handle form submission
 */
async function handleSubmit(e) {
    if (e) e.preventDefault();

    // Collect form data
    const visitors = collectVisitorData();

    if (visitors.length === 0) {
        GateAPI.showToast('Please add at least one visitor', 'error');
        return;
    }

    // Get other form fields
    const purpose = document.querySelector('[name="purpose"]')?.value ||
        document.querySelector('select')?.value || 'meeting';
    const accessArea = document.querySelector('[name="accessArea"]')?.value || 'office';
    const scheduledDate = document.querySelector('input[type="date"]')?.value;
    const scheduledTime = document.querySelector('input[type="time"]')?.value;

    const hostName = document.querySelector('[name="hostName"]')?.value ||
        document.querySelector('input[placeholder*="Host"]')?.value || '';
    const hostDepartment = document.querySelector('[name="hostDepartment"]')?.value || '';
    const hostPhone = document.querySelector('[name="hostPhone"]')?.value || '';

    const notes = document.querySelector('textarea')?.value || '';
    const vehiclePlate = document.querySelector('[name="vehiclePlate"]')?.value || '';

    // Validate
    if (!scheduledDate || !scheduledTime) {
        GateAPI.showToast('Please select date and time', 'error');
        return;
    }

    if (!hostName) {
        GateAPI.showToast('Please provide host/contact information', 'error');
        return;
    }

    // Prepare request data
    const requestData = {
        type: 'visitor',
        purpose,
        accessArea,
        scheduledDate,
        scheduledTime,
        visitors,
        host: {
            name: hostName,
            department: hostDepartment,
            phone: hostPhone
        },
        vehiclePlate,
        notes
    };

    try {
        GateAPI.showLoading(document.body, true);

        const result = await GateAPI.Visitor.create(requestData);

        if (result.success) {
            GateAPI.showToast('Request submitted successfully!', 'success');

            // Show success message and redirect
            setTimeout(() => {
                if (confirm(`Request ${result.data.id} created successfully!\n\nView all requests?`)) {
                    window.location.href = '/all-requests';
                } else {
                    window.location.href = '/';
                }
            }, 500);
        }
    } catch (error) {
        GateAPI.showToast(`Failed to submit: ${error.message}`, 'error');
    } finally {
        GateAPI.showLoading(document.body, false);
    }
}

// Expose for debugging
window.requestForm = {
    addVisitor,
    collectVisitorData,
    submit: handleSubmit
};
