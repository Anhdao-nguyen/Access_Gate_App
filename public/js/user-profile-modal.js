/**
 * Request Detail Modal Implementation
 * Extension for User Profile Drawer
 */

// Add these methods to the UserProfileDrawer class

UserProfileDrawer.prototype.viewRequestDetail = async function (id) {
    console.log('View detail:', id);

    // Fetch request details - Replace with actual API call
    const requestData = await this.fetchRequestDetail(id);

    if (!requestData) {
        alert('Unable to load request details');
        return;
    }

    // Render modal
    this.renderRequestDetailModal(requestData);
    this.openModal();
};

UserProfileDrawer.prototype.fetchRequestDetail = async function (id) {
    // Simulate API call - Replace with actual endpoint
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock detailed data
    const mockData = {
        'REQ-2024-0123': {
            id: 'REQ-2024-0123',
            status: 'pending',
            visitor: {
                fullName: 'Sarah Connor',
                company: 'Cyberdyne Systems',
                idCard: '9821 **** ****',
                phone: '+1 (555) 019-2834',
                email: 'sarah.connor@cyberdyne.com',
                ppe: {
                    hairnet: true,
                    safetyShoes: true,
                    shoeSize: '38'
                }
            },
            visit: {
                purpose: 'Business Meeting',
                date: 'Jan 20, 2024',
                time: '10:30 AM',
                accessArea: 'Operation Area',
                host: 'Dr. Silberman',
                hostPosition: 'Department Manager',
                notes: 'VIP client visit - requires escort to production floor'
            },
            request: {
                createdBy: 'John Doe',
                createdByPosition: 'Sales Manager',
                createdOn: 'Jan 18, 2024 3:45 PM',
                department: 'Sales Department'
            }
        },
        'REQ-2024-0124': {
            id: 'REQ-2024-0124',
            status: 'pending',
            visitor: {
                fullName: 'John Wick',
                company: 'Continental Hotel',
                idCard: '1234 **** ****',
                phone: '+1 (555) 123-4567',
                email: 'john.wick@continental.com',
                ppe: {
                    hairnet: false,
                    safetyShoes: false,
                    shoeSize: null
                }
            },
            visit: {
                purpose: 'Contractor Work',
                date: 'Jan 20, 2024',
                time: '2:00 PM',
                accessArea: 'Office Area',
                host: 'Jane Smith',
                hostPosition: 'HR Manager',
                notes: 'Maintenance work - no factory access required'
            },
            request: {
                createdBy: 'Jane Smith',
                createdByPosition: 'HR Manager',
                createdOn: 'Jan 19, 2024 9:15 AM',
                department: 'Human Resources'
            }
        },
        'REQ-2024-0156': {
            id: 'REQ-2024-0156',
            status: 'approved',
            visitor: {
                fullName: 'Sarah Connor',
                company: 'Cyberdyne Systems',
                idCard: '9821 **** ****',
                phone: '+1 (555) 019-2834',
                email: 'sarah.connor@cyberdyne.com',
                ppe: {
                    hairnet: true,
                    safetyShoes: true,
                    shoeSize: '38'
                }
            },
            visit: {
                purpose: 'Visitor Meeting',
                date: 'Jan 25, 2024',
                time: '2:00 PM',
                accessArea: 'Office Area',
                host: 'Dr. Silberman',
                hostPosition: 'Operations Director',
                notes: 'Regular business meeting'
            },
            request: {
                createdBy: 'Admin User',
                createdByPosition: 'Operations Manager',
                createdOn: 'Jan 18, 2024 10:20 AM',
                department: 'Operations'
            },
            approval: {
                approvedBy: 'Plant Manager',
                approvedOn: 'Jan 18, 2024 11:30 AM',
                comments: 'Approved - regular visitor'
            }
        },
        'REQ-2024-0145': {
            id: 'REQ-2024-0145',
            status: 'pending',
            visitor: {
                fullName: 'John Wick',
                company: 'Continental Hotel',
                idCard: '1234 **** ****',
                phone: '+1 (555) 123-4567',
                email: 'john.wick@continental.com',
                ppe: {
                    hairnet: false,
                    safetyShoes: true,
                    shoeSize: '42'
                }
            },
            visit: {
                purpose: 'Business Meeting',
                date: 'Jan 22, 2024',
                time: '10:00 AM',
                accessArea: 'Operation Area',
                host: 'Marcus',
                hostPosition: 'Production Manager',
                notes: 'Factory tour required'
            },
            request: {
                createdBy: 'Admin User',
                createdByPosition: 'Operations Manager',
                createdOn: 'Jan 17, 2024 2:15 PM',
                department: 'Operations'
            }
        }
    };

    return mockData[id] || null;
};

UserProfileDrawer.prototype.renderRequestDetailModal = function (data) {
    const modal = document.getElementById('request-detail-modal');
    const modalContent = modal.querySelector('div');

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-green-200 dark:border-green-800',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 border-red-200 dark:border-red-800'
    };

    modalContent.innerHTML = `
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-6 z-10">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Request Details</h2>
                <button onclick="userProfile.closeModal()" class="size-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span class="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
                </button>
            </div>
            <div class="flex items-center gap-3">
                <span class="px-4 py-2 rounded-full ${statusColors[data.status]} text-sm font-bold uppercase border">${data.status}</span>
                <span class="text-lg font-mono font-bold text-slate-900 dark:text-white">${data.id}</span>
            </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6">
            <!-- Visitor Information -->
            <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <h3 class="text-base font-bold uppercase text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span class="material-symbols-outlined text-primary">person</span>
                    Visitor Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Full Name</label>
                        <p class="text-base font-semibold text-slate-900 dark:text-white">${data.visitor.fullName}</p>
                    </div>
                    <div>
                        <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Company</label>
                        <p class="text-base font-semibold text-slate-900 dark:text-white">${data.visitor.company}</p>
                    </div>
                    <div>
                        <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">ID Card / Passport</label>
                        <p class="text-base font-mono font-bold text-slate-900 dark:text-white">${data.visitor.idCard}</p>
                    </div>
                    <div>
                        <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Phone Number</label>
                        <p class="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined !text-lg text-slate-400">call</span>
                            ${data.visitor.phone}
                        </p>
                    </div>
                    ${data.visitor.email ? `
                    <div class="md:col-span-2">
                        <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Email</label>
                        <p class="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined !text-lg text-slate-400">email</span>
                            ${data.visitor.email}
                        </p>
                    </div>
                    ` : ''}
                    <div class="md:col-span-2">
                        <label class="text-xs font-bold uppercase text-slate-500 mb-2 block">Safety Equipment (PPE)</label>
                        <div class="flex flex-wrap gap-2">
                            ${data.visitor.ppe.hairnet ?
            '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm font-semibold"><span class="material-symbols-outlined !text-base">check_circle</span>Hairnet</span>' :
            '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm"><span class="material-symbols-outlined !text-base">cancel</span>Hairnet</span>'
        }
                            ${data.visitor.ppe.safetyShoes ?
            `<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm font-semibold"><span class="material-symbols-outlined !text-base">check_circle</span>Safety Shoes (Size: ${data.visitor.ppe.shoeSize})</span>` :
            '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm"><span class="material-symbols-outlined !text-base">cancel</span>Safety Shoes</span>'
        }
                        </div>
                    </div>
                </div>
            </div>

            <!-- Visit Details -->
            <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <h3 class="text-base font-bold uppercase text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span class="material-symbols-outlined text-primary">event</span>
                    Visit Details
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Purpose</label>
                        <p class="text-base font-semibold text-slate-900 dark:text-white">${data.visit.purpose}</p>
                    </div>
                    <div>
                        <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Access Area</label>
                        <p class="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined !text-lg text-slate-400">location_on</span>
                            ${data.visit.accessArea}
                        </p>
                    </div>
                    <div>
                        <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Visit Date</label>
                        <p class="text-base font-semibold text-slate-900 dark:text-white">${data.visit.date}</p>
                    </div>
                    <div>
                        <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Visit Time</label>
                        <p class="text-base font-semibold text-slate-900 dark:text-white">${data.visit.time}</p>
                    </div>
                    <div class="md:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <label class="text-xs font-bold uppercase text-slate-500 mb-2 block">Host / Contact Person</label>
                        <div class="flex items-center gap-3">
                            <div class="size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg">
                                ${data.visit.host.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                                <p class="text-base font-bold text-slate-900 dark:text-white">${data.visit.host}</p>
                                <p class="text-sm text-slate-600 dark:text-slate-400">${data.visit.hostPosition}</p>
                            </div>
                        </div>
                    </div>
                    ${data.visit.notes ? `
                    <div class="md:col-span-2">
                        <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Additional Notes</label>
                        <p class="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">${data.visit.notes}</p>
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- Request Information -->
            <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <h3 class="text-base font-bold uppercase text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span class="material-symbols-outlined text-primary">info</span>
                    Request Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Created By</label>
                        <p class="text-base font-semibold text-slate-900 dark:text-white">${data.request.createdBy}</p>
                        <p class="text-sm text-slate-600 dark:text-slate-400">${data.request.createdByPosition}</p>
                    </div>
                    <div>
                        <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Department</label>
                        <p class="text-base font-semibold text-slate-900 dark:text-white">${data.request.department}</p>
                    </div>
                    <div class="md:col-span-2">
                        <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Created On</label>
                        <p class="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span class="material-symbols-outlined !text-lg text-slate-400">schedule</span>
                            ${data.request.createdOn}
                        </p>
                    </div>
                </div>
            </div>

            ${data.approval ? `
            <!-- Approval Information -->
            <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                <h3 class="text-base font-bold uppercase text-green-900 dark:text-green-200 mb-4 flex items-center gap-2 border-b border-green-200 dark:border-green-800 pb-2">
                    <span class="material-symbols-outlined">check_circle</span>
                    Approval Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs font-bold uppercase text-green-700 dark:text-green-400 mb-1 block">Approved By</label>
                        <p class="text-base font-semibold text-green-900 dark:text-green-100">${data.approval.approvedBy}</p>
                    </div>
                    <div>
                        <label class="text-xs font-bold uppercase text-green-700 dark:text-green-400 mb-1 block">Approved On</label>
                        <p class="text-base font-semibold text-green-900 dark:text-green-100">${data.approval.approvedOn}</p>
                    </div>
                    ${data.approval.comments ? `
                    <div class="md:col-span-2">
                        <label class="text-xs font-bold uppercase text-green-700 dark:text-green-400 mb-1 block">Comments</label>
                        <p class="text-sm text-green-800 dark:text-green-200 bg-white dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">${data.approval.comments}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            <!-- Approval Actions (Manager Only, Pending Status) -->
            ${this.userRole === 'manager' && data.status === 'pending' ? `
            <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <h3 class="text-base font-bold uppercase text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary">task_alt</span>
                    Approval Actions
                </h3>
                <div class="space-y-3">
                    <button onclick="userProfile.approveRequestFromModal('${data.id}')" class="w-full h-12 flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md">
                        <span class="material-symbols-outlined">check_circle</span>
                        Approve Request
                    </button>
                    <button onclick="userProfile.showRejectDialog('${data.id}')" class="w-full h-12 flex items-center justify-center gap-2 bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-900/50 rounded-lg font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                        <span class="material-symbols-outlined">cancel</span>
                        Reject Request
                    </button>
                </div>
                
                <!-- Rejection Reason (Initially Hidden) -->
                <div id="rejection-reason-box" class="hidden mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <label class="block text-sm font-bold text-red-900 dark:text-red-200 mb-2">Rejection Reason *</label>
                    <textarea id="rejection-reason" rows="3" placeholder="Please provide a reason for rejection..." class="w-full px-4 py-3 border-2 border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 resize-none"></textarea>
                    <div class="flex gap-2 mt-3">
                        <button onclick="userProfile.confirmRejectRequest('${data.id}')" class="flex-1 h-10 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                            Confirm Rejection
                        </button>
                        <button onclick="userProfile.cancelRejectDialog()" class="flex-1 h-10 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
            ` : ''}
        </div>

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-6">
            <button onclick="userProfile.closeModal()" class="w-full h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Close
            </button>
        </div>
    `;
};

UserProfileDrawer.prototype.openModal = function () {
    const modal = document.getElementById('request-detail-modal');
    const modalContent = modal.querySelector('div');

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
};

UserProfileDrawer.prototype.closeModal = function () {
    const modal = document.getElementById('request-detail-modal');
    const modalContent = modal.querySelector('div');

    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 200);

    // Restore body scroll
    document.body.style.overflow = '';
};

UserProfileDrawer.prototype.showRejectDialog = function () {
    const rejectBox = document.getElementById('rejection-reason-box');
    if (rejectBox) {
        rejectBox.classList.remove('hidden');
        document.getElementById('rejection-reason')?.focus();
    }
};

UserProfileDrawer.prototype.cancelRejectDialog = function () {
    const rejectBox = document.getElementById('rejection-reason-box');
    if (rejectBox) {
        rejectBox.classList.add('hidden');
        document.getElementById('rejection-reason').value = '';
    }
};

UserProfileDrawer.prototype.approveRequestFromModal = async function (id) {
    if (!confirm(`Approve request ${id}?`)) return;

    try {
        console.log('Approving from modal:', id);
        // Implement API call here
        // await fetch(`/api/requests/${id}/approve`, { method: 'POST' });

        alert('Request approved successfully!');
        this.closeModal();

        // Reload data
        if (this.userRole === 'manager') {
            await this.loadApprovals();
        } else {
            await this.loadRequests();
        }
    } catch (error) {
        console.error('Error approving request:', error);
        alert('Failed to approve request. Please try again.');
    }
};

UserProfileDrawer.prototype.confirmRejectRequest = async function (id) {
    const reason = document.getElementById('rejection-reason')?.value.trim();

    if (!reason) {
        alert('Please provide a reason for rejection');
        return;
    }

    try {
        console.log('Rejecting from modal:', id, 'Reason:', reason);
        // Implement API call here
        // await fetch(`/api/requests/${id}/reject`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ reason })
        // });

        alert('Request rejected successfully.');
        this.closeModal();

        // Reload data
        if (this.userRole === 'manager') {
            await this.loadApprovals();
        } else {
            await this.loadRequests();
        }
    } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Failed to reject request. Please try again.');
    }
};
