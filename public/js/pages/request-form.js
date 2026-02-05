/**
 * Request Form Handler
 * Handles visitor request form submission
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent default form submission

        // Disable submit button to prevent double submission
        submitButton.disabled = true;
        const originalHTML = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Submitting...';

        try {
            // Collect form data
            const formData = new FormData(form);

            // Parse visitors array
            const visitors = [];
            const visitorIndexes = new Set();

            // Find all visitor indexes
            for (const [key] of formData.entries()) {
                const match = key.match(/visitors\[(\d+)\]/);
                if (match) {
                    visitorIndexes.add(parseInt(match[1]));
                }
            }

            // Build visitor objects
            visitorIndexes.forEach(index => {
                const fullName = formData.get(`visitors[${index}][fullName]`) || '';
                const company = formData.get(`visitors[${index}][company]`) || '';
                const idCard = formData.get(`visitors[${index}][idCard]`) || '';
                const phone = formData.get(`visitors[${index}][phoneNumber]`) || '';

                // Skip empty visitors (no data filled)
                if (!fullName && !company && !idCard && !phone) {
                    console.log(`Visitor ${index}: empty, skipping`);
                    return;
                }

                const visitor = {
                    fullName,
                    company,
                    idCard: idCard || null,  // Optional
                    phone: phone || null,     // Optional
                    ppeHairnet: formData.get(`visitors[${index}][ppeHairnet]`) === 'on',
                    ppeSafetyShoes: formData.get(`visitors[${index}][ppeSafetyShoes]`) === 'on',
                    shoeSize: formData.get(`visitors[${index}][shoeSize]`) || null
                };

                console.log(`Visitor ${index}:`, visitor);

                // Validate required fields (only fullName and company)
                if (!fullName || !company) {
                    console.error(`Visitor ${index} missing required fields:`, {
                        hasFullName: !!fullName,
                        hasCompany: !!company
                    });
                    throw new Error(`Visitor ${index + 1}: Please fill in Full Name and Company (required)`);
                }

                visitors.push(visitor);
            });

            if (visitors.length === 0) {
                throw new Error('Please fill in at least one visitor with Full Name and Company');
            }

            // Get access area to validate PPE requirements
            const accessArea = formData.get('accessArea');

            // Validate PPE requirements for non-office areas
            if (accessArea && accessArea.toLowerCase() !== 'office') {
                for (let i = 0; i < visitors.length; i++) {
                    const visitor = visitors[i];
                    if (!visitor.ppeHairnet && !visitor.ppeSafetyShoes) {
                        throw new Error(`Visitor ${i + 1} (${visitor.fullName}): Please select at least one Safety Equipment (PPE) for non-office areas`);
                    }
                    // If safety shoes selected, shoe size is required
                    if (visitor.ppeSafetyShoes && !visitor.shoeSize) {
                        throw new Error(`Visitor ${i + 1} (${visitor.fullName}): Please select shoe size when Safety Shoes is checked`);
                    }
                }
            }

            // Prepare request data
            const arrivalDateTime = formData.get('arrivalDateTime');
            const requestData = {
                type: formData.get('type') || 'visitor',
                purpose: formData.get('purpose') || null,
                accessArea: formData.get('accessArea') || null,
                scheduledDate: arrivalDateTime ? arrivalDateTime.split('T')[0] : null,
                scheduledTime: arrivalDateTime ? arrivalDateTime.split('T')[1] : null,
                managerApproverId: window.GateAPI.Auth.getCurrentUser()?.managerId || window.GateAPI.Auth.getCurrentUser()?.manager_id || null,
                visitors: visitors,
                host: {
                    name: formData.get('hostContact') || null,
                    department: null,
                    phone: null,
                    managerName: formData.get('hostManagerName') || null,
                    managerEmail: formData.get('hostManagerEmail') || null
                },
                vehiclePlate: formData.get('vehicles') || null,
                notes: formData.get('notes') || null
            };

            // Validate required fields
            if (!requestData.purpose) {
                throw new Error('Please select a purpose for the visit');
            }
            if (!requestData.scheduledDate || !requestData.scheduledTime) {
                throw new Error('Please select arrival date and time');
            }
            if (!requestData.host.name) {
                throw new Error('Please provide internal host/contact person');
            }

            // Submit to API
            console.log('Submitting request:', requestData);

            const response = await window.GateAPI.Visitor.create(requestData);

            if (response.success) {
                // Show success message
                showNotification('success', 'Request submitted successfully!',
                    `Request ID: ${response.data.id}. You will be notified once approved.`);

                // Reset form after 1 second
                setTimeout(() => {
                    form.reset();
                    // Reset visitor count
                    const visitorList = document.getElementById('visitor-list');
                    const visitorCards = visitorList.querySelectorAll('.visitor-card');
                    visitorCards.forEach((card, idx) => {
                        if (idx > 0) card.remove(); // Remove all except first visitor
                    });
                    document.getElementById('visitor-count').value = 1;

                    // Redirect to home or requests page
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                }, 1000);
            } else {
                throw new Error(response.error || 'Failed to submit request');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('error', 'Submission Failed', error.message || 'An error occurred while submitting your request');
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.innerHTML = originalHTML;
        }
    });

    /**
     * Show notification/alert
     */
    function showNotification(type, title, message) {
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        const icon = type === 'success' ? 'check_circle' : 'error';

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg max-w-md z-50 flex items-start gap-3`;
        notification.innerHTML = `
            <span class="material-symbols-outlined text-2xl">${icon}</span>
            <div class="flex-1">
                <div class="font-semibold">${title}</div>
                <div class="text-sm opacity-90">${message}</div>
            </div>
            <button onclick="this.parentElement.remove()" class="text-white hover:text-gray-200">
                <span class="material-symbols-outlined">close</span>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
});
