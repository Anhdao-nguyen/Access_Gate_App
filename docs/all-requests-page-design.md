# All Requests Page - Design Specification
## Access Gate System - Request Monitor & Management

---

## 1. Overview & Access Control

### Page Purpose
Centralized dashboard for monitoring and managing all types of requests across multiple factory sites.

### User Roles & Permissions

| Role | Site Access | Permissions |
|------|-------------|-------------|
| **Admin** | All sites | View all, Approve/Reject, Export, Edit, Cancel |
| **HSE Team** | Assigned site(s) only | View assigned site, Approve/Reject (if delegated), Export |
| **Plant Manager** | Own site | View own site, Approve/Reject |
| **Regular User** | N/A | No access to this page |

### Access Control Logic
```javascript
// Site-based filtering
if (user.role === 'admin') {
    siteScope = 'all';
    availableSites = getAllSites();
} else if (user.role === 'hse' || user.role === 'manager') {
    siteScope = user.assigned_sites; // ['long_an', 'tay_ninh']
    availableSites = user.assigned_sites;
}
```

---

## 2. Page Layout & Structure

### Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (Global - same as other pages)                      │
│  Logo | Access Gate System | Date/Time | Notifications | 👤 │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  PAGE HEADER                                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📋 All Requests                                      │   │
│  │ Monitor and manage all requests across sites         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─── KPI CARDS ───────────────────────────────────────┐   │
│  │ [Today: 24] [Pending: 12] [Approved: 8] [Rejected: 2]│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [🔽 Export CSV]                                            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  FILTER BAR                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🔍 Search: Request ID, Visitor, Company...          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [Site ▼] [Type ▼] [Status ▼] [From] [To] [🔄 Reset]      │
│                                                              │
│  Active Filters: [Site: Long An ✕] [Status: Pending ✕]     │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  DATA TABLE                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ID    │Created│Site│Type│Requester│Subject│Time│Status│  │
│  ├──────────────────────────────────────────────────────┤   │
│  │REQ-123│Jan 20│LA  │VIS │John Doe │Sarah C│10:30│⏳   │  │
│  │REQ-124│Jan 20│TN  │CON │Jane S.  │ABC Co │14:00│✅   │  │
│  │REQ-125│Jan 19│LA  │GDS │Admin    │Goods X│09:00│❌   │  │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Showing 1-20 of 156 | [< 1 2 3 ... 8 >]                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Component Specifications

### 3.1 Page Header

**Title Section:**
```html
<div class="page-header">
  <div class="flex items-center gap-3 mb-2">
    <span class="material-symbols-outlined text-primary !text-3xl">assignment</span>
    <h1 class="text-3xl font-bold">All Requests</h1>
  </div>
  <p class="text-slate-600">Monitor and manage all requests across sites</p>
</div>
```

**KPI Cards:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   TODAY      │   PENDING    │   APPROVED   │   REJECTED   │
│     24       │      12      │       8      │       2      │
│   requests   │   awaiting   │   this week  │   this week  │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Styling:**
- Grid: 4 columns on desktop, 2 on tablet, 1 on mobile
- Each card: gradient background, icon, number (text-3xl), label (text-xs)
- Colors: Blue (today), Yellow (pending), Green (approved), Red (rejected)

**Export Button:**
- Position: Top-right of header
- Icon: download
- Dropdown: CSV / Excel / PDF
- Permission check: Admin/HSE only

---

### 3.2 Filter Bar

**Search Box:**
```
┌─────────────────────────────────────────────────────┐
│ 🔍  Search by ID, Visitor, Company, Phone, Plate... │
└─────────────────────────────────────────────────────┘
```
- Full-width, prominent
- Debounced search (300ms)
- Clear button (X) when has value

**Filter Dropdowns:**

**A. Site/Factory Filter**
```javascript
// Admin view
<select name="site">
  <option value="all">All Sites</option>
  <option value="long_an">Long An Plant</option>
  <option value="tay_ninh">Tay Ninh Plant</option>
  <option value="phan_thiet">Phan Thiet Plant</option>
</select>

// HSE view (locked to assigned site)
<select name="site" disabled>
  <option value="long_an" selected>Long An Plant</option>
</select>
<span class="text-xs text-slate-500">Your assigned site</span>
```

**B. Request Type Filter** (Multi-select)
```
☐ Visitors
☐ Contractors
☐ Goods In/Out
☐ Tools & Equipment
```

**C. Status Filter** (Multi-select)
```
☐ Pending Approval
☐ Approved
☐ Rejected
☐ Checked In
☐ Checked Out
☐ Cancelled
☐ Expired
```

**D. Date Range**
```
From: [Jan 13, 2024] To: [Jan 20, 2024]
```
- Default: Last 7 days
- Quick filters: Today / This Week / This Month / Custom

**Filter Chips (Active Filters):**
```
Active Filters: [Site: Long An ✕] [Type: Visitors ✕] [Status: Pending ✕]
```
- Displayed below filter bar
- Click X to remove individual filter
- "Clear All" button

---

### 3.3 Data Table

**Column Structure:**

| Column | Width | Sortable | Description |
|--------|-------|----------|-------------|
| Request ID | 120px | ✅ | REQ-2024-XXXX (monospace, bold) |
| Created | 140px | ✅ | Jan 20, 10:30 AM |
| Site | 100px | ✅ | LA / TN / PT (badge) |
| Type | 100px | ✅ | Icon + label |
| Requester | 150px | ❌ | Name + position (small) |
| Subject | 200px | ❌ | Main name + company/detail |
| Scheduled | 140px | ✅ | Date & time |
| Status | 120px | ✅ | Status chip |
| Actions | 80px | ❌ | View button |

**Type Icons & Colors:**
```javascript
const typeConfig = {
  visitor: { icon: 'groups', color: 'blue', label: 'Visitor' },
  contractor: { icon: 'engineering', color: 'orange', label: 'Contractor' },
  goods: { icon: 'local_shipping', color: 'purple', label: 'Goods' },
  tools: { icon: 'construction', color: 'emerald', label: 'Tools' }
};
```

**Status Chips:**
```javascript
const statusConfig = {
  pending: { bg: 'yellow-100', text: 'yellow-800', label: 'Pending' },
  approved: { bg: 'green-100', text: 'green-800', label: 'Approved' },
  rejected: { bg: 'red-100', text: 'red-800', label: 'Rejected' },
  checked_in: { bg: 'blue-100', text: 'blue-800', label: 'Checked In' },
  checked_out: { bg: 'slate-100', text: 'slate-800', label: 'Checked Out' },
  cancelled: { bg: 'slate-100', text: 'slate-600', label: 'Cancelled' },
  expired: { bg: 'orange-100', text: 'orange-800', label: 'Expired' }
};
```

**Row Interaction:**
- Hover: bg-slate-50, border-primary/20
- Click: Open detail drawer
- Alt-click: Open in new tab (optional)

**Pagination:**
```
Showing 1-20 of 156 requests
[< Previous] [1] [2] [3] ... [8] [Next >]
```
- Items per page: 20 (default), 50, 100
- Server-side pagination

---

### 3.4 Request Detail Drawer

**Trigger:** Click table row or "View" button

**Layout:**
```
┌─────────────────────────────────────┐
│ Request Details              [✕]    │
├─────────────────────────────────────┤
│ [Status Badge] REQ-2024-0123        │
│                                     │
│ ┌─ Request Information ──────────┐ │
│ │ Site: Long An Plant            │ │
│ │ Type: Visitor                  │ │
│ │ Created: Jan 20, 10:30 AM      │ │
│ │ Created by: John Doe (Sales)   │ │
│ └────────────────────────────────┘ │
│                                     │
│ ┌─ Type-Specific Details ────────┐ │
│ │ [Content varies by type]       │ │
│ │ - Visitor: Name, Company, PPE  │ │
│ │ - Contractor: Work details     │ │
│ │ - Goods: Items, Quantity       │ │
│ │ - Tools: Equipment list        │ │
│ └────────────────────────────────┘ │
│                                     │
│ ┌─ Visit/Schedule Details ───────┐ │
│ │ Date: Jan 25, 2024             │ │
│ │ Time: 2:00 PM                  │ │
│ │ Access Area: Operation Area    │ │
│ │ Host: Dr. Silberman            │ │
│ └────────────────────────────────┘ │
│                                     │
│ ┌─ Approval Timeline ────────────┐ │
│ │ ● Created (Jan 20, 10:30)      │ │
│ │ ● Pending Approval             │ │
│ │ ○ Approved (awaiting)          │ │
│ │ ○ Check-in (awaiting)          │ │
│ └────────────────────────────────┘ │
│                                     │
│ [Approve] [Reject] [Edit] [Cancel] │
└─────────────────────────────────────┘
```

**Width:** 480px (desktop), full-screen (mobile)

**Actions (Role-based):**
- Admin: All actions
- HSE: Approve/Reject (if delegated)
- View-only: No action buttons

---

## 4. Data Model & API Design

### 4.1 Unified Request Model

```javascript
{
  // Common fields (all request types)
  id: "REQ-2024-0123",
  site_id: "long_an",
  site_name: "Long An Plant",
  type: "visitor", // visitor | contractor | goods | tools
  status: "pending", // pending | approved | rejected | checked_in | checked_out | cancelled | expired
  
  // Timestamps
  created_at: "2024-01-20T10:30:00Z",
  updated_at: "2024-01-20T10:30:00Z",
  scheduled_at: "2024-01-25T14:00:00Z",
  
  // Creator info
  created_by: {
    id: "user_123",
    name: "John Doe",
    position: "Sales Manager",
    department: "Sales"
  },
  
  // Subject (main entity)
  subject: {
    display_name: "Sarah Connor", // or company name for goods
    secondary_info: "Cyberdyne Systems", // company or details
    avatar_url: "https://..."
  },
  
  // Approval
  approval: {
    required: true,
    status: "pending", // pending | approved | rejected
    approver_id: "user_456",
    approver_name: "Plant Manager",
    approved_at: null,
    rejection_reason: null
  },
  
  // Type-specific metadata (JSON)
  metadata: {
    // For visitor
    visitor: {
      full_name: "Sarah Connor",
      company: "Cyberdyne Systems",
      id_card: "9821****",
      phone: "+1 (555) 019-2834",
      email: "sarah@cyberdyne.com",
      ppe: { hairnet: true, safety_shoes: true, shoe_size: "38" }
    },
    // For contractor
    contractor: {
      company: "ABC Construction",
      work_description: "Electrical maintenance",
      workers_count: 5,
      equipment: ["Ladder", "Tools"]
    },
    // For goods
    goods: {
      type: "inbound", // inbound | outbound
      items: [{ name: "Raw materials", quantity: 100, unit: "kg" }],
      vehicle_plate: "29A-12345",
      driver_name: "Nguyen Van A"
    },
    // For tools
    tools: {
      items: [{ name: "Laptop", serial: "ABC123", owner: "IT Dept" }],
      purpose: "Maintenance"
    }
  },
  
  // Visit details
  visit: {
    purpose: "Business Meeting",
    access_area: "Operation Area",
    host: {
      name: "Dr. Silberman",
      position: "Department Manager",
      phone: "+84 123 456 789"
    },
    notes: "VIP client visit"
  },
  
  // Check-in/out
  checkin: {
    checked_in_at: null,
    checked_out_at: null,
    guard_name: null
  }
}
```

### 4.2 API Endpoints

**GET /api/requests**
```javascript
// Query parameters
{
  site_id: "long_an" | "all", // filtered by user role
  type: "visitor,contractor", // comma-separated
  status: "pending,approved", // comma-separated
  from: "2024-01-13",
  to: "2024-01-20",
  q: "search term", // search across multiple fields
  page: 1,
  per_page: 20,
  sort: "created_at", // created_at | scheduled_at | status
  order: "desc" // asc | desc
}

// Response
{
  data: [...requests],
  pagination: {
    total: 156,
    page: 1,
    per_page: 20,
    total_pages: 8
  },
  kpi: {
    today: 24,
    pending: 12,
    approved: 8,
    rejected: 2
  }
}
```

**GET /api/requests/:id**
```javascript
// Response: Full request object with all details
```

**POST /api/requests/:id/approve**
```javascript
// Body
{
  comments: "Approved - regular visitor"
}
```

**POST /api/requests/:id/reject**
```javascript
// Body
{
  reason: "Incomplete documentation"
}
```

**GET /api/requests/export**
```javascript
// Query: same as list endpoint
// Response: CSV/Excel file download
```

---

## 5. UI States

### 5.1 Loading State
```
┌─────────────────────────────────────┐
│ [Skeleton KPI Cards]                │
│ [Skeleton Filter Bar]               │
│ [Skeleton Table Rows x 10]          │
└─────────────────────────────────────┘
```

### 5.2 Empty State
```
┌─────────────────────────────────────┐
│           📋                        │
│     No requests found               │
│                                     │
│  Try adjusting your filters or      │
│  search term to find what you're    │
│  looking for.                       │
│                                     │
│     [Reset Filters]                 │
└─────────────────────────────────────┘
```

### 5.3 Error State
```
┌─────────────────────────────────────┐
│           ⚠️                        │
│  Failed to load requests            │
│                                     │
│  Unable to connect to server.       │
│  Please try again.                  │
│                                     │
│     [Retry]                         │
└─────────────────────────────────────┘
```

---

## 6. Responsive Design

### Desktop (≥1024px)
- Full table with all columns
- Filter bar: horizontal layout
- Drawer: 480px width

### Tablet (768px - 1023px)
- Table: hide some columns (Requester, secondary info)
- Filter bar: wrap to 2 rows
- Drawer: 400px width

### Mobile (<768px)
- Table → Card list view
- Filter bar → Drawer (slide from left)
- Detail drawer → Full screen
- KPI cards: 2 columns

**Mobile Card Layout:**
```
┌─────────────────────────────────────┐
│ REQ-2024-0123        [Pending ⏳]   │
│ Jan 20, 10:30 AM                    │
│                                     │
│ 👤 Sarah Connor                     │
│ 🏢 Cyberdyne Systems                │
│ 📍 Long An • Visitor                │
│                                     │
│              [View Details →]       │
└─────────────────────────────────────┘
```

---

## 7. Performance & Optimization

### Frontend
- Virtual scrolling for large datasets (>100 rows)
- Debounced search (300ms)
- Filter state saved to localStorage
- Lazy load detail drawer content
- Optimistic UI updates for approve/reject

### Backend
- Database indexing: site_id, type, status, created_at
- Query optimization with proper joins
- Caching for KPI calculations (Redis)
- Rate limiting on export endpoint

---

## 8. Accessibility

- Keyboard navigation: Tab through filters, table rows
- Screen reader labels for all interactive elements
- ARIA roles: table, row, cell
- Focus indicators on all focusable elements
- Color contrast: WCAG AA compliant

---

## 9. Security & Permissions

### Row-Level Security
```sql
-- PostgreSQL RLS example
CREATE POLICY request_access ON requests
  FOR SELECT
  USING (
    CASE 
      WHEN current_user_role() = 'admin' THEN true
      WHEN current_user_role() IN ('hse', 'manager') 
        THEN site_id = ANY(current_user_sites())
      ELSE false
    END
  );
```

### Action Permissions
```javascript
const canApprove = (user, request) => {
  if (user.role === 'admin') return true;
  if (user.role === 'hse' && user.sites.includes(request.site_id)) return true;
  if (user.role === 'manager' && user.sites.includes(request.site_id)) return true;
  return false;
};
```

---

## 10. Implementation Phases

### Phase 1: MVP (Week 1-2)
- ✅ Basic page layout
- ✅ Filter bar (Site, Type, Status, Date)
- ✅ Data table with pagination
- ✅ Detail drawer (view-only)
- ✅ Site-based access control

### Phase 2: Enhanced Features (Week 3)
- ✅ KPI cards
- ✅ Search functionality
- ✅ Approve/Reject actions
- ✅ Export CSV

### Phase 3: Advanced (Week 4+)
- ✅ Real-time updates (WebSocket)
- ✅ Bulk actions
- ✅ Advanced filters (Priority, Tags)
- ✅ Activity timeline
- ✅ Notifications

---

## 11. Testing Checklist

### Functional
- [ ] Admin can see all sites
- [ ] HSE can only see assigned sites
- [ ] Filters work correctly
- [ ] Search returns accurate results
- [ ] Pagination works
- [ ] Detail drawer opens/closes
- [ ] Approve/Reject actions work
- [ ] Export generates correct file

### UI/UX
- [ ] Responsive on all screen sizes
- [ ] Loading states display correctly
- [ ] Empty state shows when no results
- [ ] Error handling works
- [ ] Animations smooth (60fps)

### Performance
- [ ] Page loads in <2s
- [ ] Table renders 100+ rows smoothly
- [ ] Search debounce works
- [ ] No memory leaks

---

## 12. Microcopy & Labels

### English
- Page title: "All Requests"
- Subtitle: "Monitor and manage all requests across sites"
- Empty state: "No requests found. Try adjusting your filters."
- Error: "Failed to load requests. Please try again."

### Vietnamese (Optional)
- Page title: "Tất cả Yêu cầu"
- Subtitle: "Theo dõi và quản lý tất cả yêu cầu"
- Empty state: "Không tìm thấy yêu cầu nào. Thử điều chỉnh bộ lọc."
- Error: "Không thể tải dữ liệu. Vui lòng thử lại."

---

## 13. Navigation Integration

### Add to Main Menu
```html
<nav>
  <a href="/">
    <span class="material-symbols-outlined">home</span>
    Home
  </a>
  <a href="/request.html">
    <span class="material-symbols-outlined">add_circle</span>
    New Request
  </a>
  <a href="/all-requests.html" class="active">
    <span class="material-symbols-outlined">assignment</span>
    All Requests
  </a>
  <a href="/checkin.html">
    <span class="material-symbols-outlined">fact_check</span>
    Check-in Console
  </a>
</nav>
```

### Breadcrumb
```
Home > All Requests
```

---

## 14. Future Enhancements

1. **Dashboard Analytics**
   - Charts: Requests over time
   - Breakdown by type/site/status
   - Approval rate metrics

2. **Bulk Operations**
   - Select multiple requests
   - Bulk approve/reject
   - Bulk export

3. **Advanced Search**
   - Saved searches
   - Search history
   - Smart suggestions

4. **Notifications**
   - Real-time alerts for new requests
   - Approval reminders
   - Status change notifications

5. **Audit Trail**
   - Full history of changes
   - Who did what when
   - Compliance reporting

---

**End of Design Specification**
