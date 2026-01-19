# User Profile Design Specification
## Access Gate System - User Profile & Role-Based Dashboard

---

## 1. Entry Point & Interaction

### Avatar Click Behavior
**Desktop (≥768px):**
- Click avatar → Opens right-side drawer (slide-over)
- Drawer width: 420px
- Overlay backdrop: semi-transparent dark (rgba(0,0,0,0.4))
- Animation: slide-in from right (300ms ease-out)
- Click outside or ESC key → closes drawer

**Mobile (<768px):**
- Click avatar → Opens full-screen page
- Slide-up animation (300ms)
- Back button in header to return

### Avatar States
- **Default:** Ring border (2px, border-color)
- **Hover:** Ring color changes to primary, scale 1.05
- **Active/Open:** Ring color primary, subtle glow effect

---

## 2. Profile Drawer/Page Structure

### Header Section
```
┌─────────────────────────────────────────┐
│  [X Close]                              │
│                                         │
│         [Large Avatar - 96px]           │
│              Online ●                   │
│                                         │
│         Admin User                      │
│      [Badge: Plant Manager]             │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 👤 Nguyen Van A                   │ │
│  │ 💼 Operations Manager             │ │
│  │ 🏭 Long An Plant                  │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Visual Details:**
- Background: white (light mode) / slate-900 (dark mode)
- Avatar: 96px diameter, ring-4 border-primary
- Online indicator: green dot (absolute positioned)
- Name: text-2xl font-bold
- Role badge: inline-flex, rounded-full, bg-primary/10, text-primary, px-3 py-1, text-sm
- Info cards: bg-slate-50, rounded-lg, p-4, gap-3, icon + text layout

---

## 3. Content Area - Role-Based

### A. Plant Manager View

#### KPI Summary Cards
```
┌──────────────┬──────────────┬──────────────┐
│  Pending     │   Today      │   This Week  │
│     12       │      5       │      28      │
└──────────────┴──────────────┴──────────────┘
```

**Card Style:**
- Grid: 3 columns
- Each card: bg-gradient (subtle), rounded-xl, p-4
- Number: text-3xl font-bold
- Label: text-xs uppercase text-slate-500

#### Pending Approvals Section

**Section Header:**
```
┌─────────────────────────────────────────┐
│  Pending Approvals                      │
│  [Filter: All ▼] [Search 🔍]           │
└─────────────────────────────────────────┘
```

**Filter Options:**
- All (default)
- Pending
- Approved Today
- Rejected

**Approval Item Card:**
```
┌─────────────────────────────────────────┐
│ [Avatar] Sarah Connor                   │
│          Cyberdyne Systems              │
│                                         │
│ 📋 REQ-2024-0123                       │
│ 📅 Jan 20, 2024 • 10:30 AM            │
│ 👤 Requested by: John Doe              │
│                                         │
│ [PENDING]                              │
│                                         │
│ [✓ Approve] [✗ Reject] [👁 Details]   │
└─────────────────────────────────────────┘
```

**Card Specifications:**
- Border: 1px solid border-color
- Hover: shadow-md, border-primary/30
- Padding: p-5
- Gap between elements: gap-3
- Status chip: 
  - Pending: bg-yellow-100 text-yellow-800
  - Approved: bg-green-100 text-green-800
  - Rejected: bg-red-100 text-red-800

**Action Buttons:**
- Approve: bg-green-600 text-white, hover:bg-green-700
- Reject: bg-white text-red-600 border-red-200, hover:bg-red-50
- Details: bg-slate-100 text-slate-700, hover:bg-slate-200
- Size: h-10 px-4, rounded-lg, font-semibold

**Empty State:**
```
┌─────────────────────────────────────────┐
│                                         │
│         [Icon: ✓ Check Circle]          │
│                                         │
│      All caught up!                     │
│   No pending approvals at the moment    │
│                                         │
└─────────────────────────────────────────┘
```

---

### B. Normal User View

#### My Requests Section

**Section Header:**
```
┌─────────────────────────────────────────┐
│  My Requests                            │
│  [Search: Name, ID...] [Filter ▼]      │
│  [Sort: Newest First ▼]                │
└─────────────────────────────────────────┘
```

**Filter Options:**
- All Requests
- Pending
- Approved
- Rejected
- Cancelled

**Request Item Card:**
```
┌─────────────────────────────────────────┐
│ REQ-2024-0156              [APPROVED]   │
│                                         │
│ 👥 Visitor Meeting                     │
│ Sarah Connor • Cyberdyne Systems        │
│                                         │
│ 📅 Jan 25, 2024 at 2:00 PM             │
│ 📍 Office Area                         │
│                                         │
│ Created: Jan 18, 2024                   │
│                                         │
│          [Cancel] [View Details]        │
└─────────────────────────────────────────┘
```

**Card Specifications:**
- Same styling as approval cards
- Request ID: text-sm font-mono font-bold
- Visitor info: text-base font-semibold
- Meta info: text-sm text-slate-600, with icons
- Created date: text-xs text-slate-500

**Action Buttons:**
- Cancel (only for Pending): bg-white text-red-600 border-red-200
- View Details: bg-primary text-white
- Disabled state for cancelled/past requests

**Empty State:**
```
┌─────────────────────────────────────────┐
│                                         │
│         [Icon: 📋 Clipboard]            │
│                                         │
│      No requests yet                    │
│   Create your first visitor request     │
│                                         │
│      [+ New Request]                    │
└─────────────────────────────────────────┘
```

---

## 4. Request Detail Modal

**Triggered by:** Click "View Details" or approval item

**Layout:**
```
┌─────────────────────────────────────────┐
│  Request Details            [X Close]   │
├─────────────────────────────────────────┤
│                                         │
│  [Status Badge: PENDING]                │
│  Request #REQ-2024-0123                 │
│                                         │
│  ┌─ Visitor Information ──────────────┐│
│  │ Name: Sarah Connor                 ││
│  │ Company: Cyberdyne Systems         ││
│  │ ID/Passport: 9821 **** ****        ││
│  │ Phone: +1 (555) 019-2834           ││
│  │ PPE: ☑ Hairnet ☑ Safety Shoes     ││
│  │ Shoe Size: 38                      ││
│  └────────────────────────────────────┘│
│                                         │
│  ┌─ Visit Details ────────────────────┐│
│  │ Purpose: Business Meeting          ││
│  │ Date & Time: Jan 20, 2024 10:30 AM ││
│  │ Access Area: Operation Area        ││
│  │ Host: Dr. Silberman                ││
│  └────────────────────────────────────┘│
│                                         │
│  ┌─ Request Info ─────────────────────┐│
│  │ Created by: John Doe               ││
│  │ Created on: Jan 18, 2024 3:45 PM   ││
│  │ Notes: VIP client visit            ││
│  └────────────────────────────────────┘│
│                                         │
│  [Plant Manager Only:]                  │
│  ┌─ Approval Actions ─────────────────┐│
│  │ [✓ Approve Request]                ││
│  │ [✗ Reject Request]                 ││
│  │                                    ││
│  │ Rejection Reason (if reject):      ││
│  │ [Textarea]                         ││
│  └────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

**Modal Specifications:**
- Max-width: 640px
- Backdrop: rgba(0,0,0,0.5)
- Animation: fade-in + scale (0.95 → 1)
- Sections: collapsible accordion style (optional)
- Approval buttons: full-width, h-12, prominent

---

## 5. UI States

### Loading State
```
┌─────────────────────────────────────────┐
│  [Skeleton Avatar]                      │
│  [Skeleton Text Line]                   │
│  [Skeleton Text Line]                   │
│                                         │
│  [Skeleton Card]                        │
│  [Skeleton Card]                        │
│  [Skeleton Card]                        │
└─────────────────────────────────────────┘
```

**Implementation:**
- Shimmer animation (pulse effect)
- bg-slate-200 → bg-slate-300 gradient
- Maintain layout structure

### Error State
```
┌─────────────────────────────────────────┐
│                                         │
│         [Icon: ⚠️ Alert Triangle]       │
│                                         │
│      Oops! Something went wrong         │
│   Unable to load your profile data      │
│                                         │
│         [🔄 Try Again]                  │
└─────────────────────────────────────────┘
```

---

## 6. Footer Section

**Sign Out Button:**
```
┌─────────────────────────────────────────┐
│                                         │
│  [🚪 Sign Out]                          │
│                                         │
└─────────────────────────────────────────┘
```

**Button Style:**
- Full-width
- bg-white border-2 border-red-200
- text-red-600 font-bold
- hover:bg-red-50 hover:border-red-300
- h-12 rounded-lg
- Positioned at bottom with mt-auto

---

## 7. Microcopy & Labels

### Section Titles
- "My Profile"
- "Pending Approvals" (Manager)
- "My Requests" (User)
- "Request Details"

### Button Labels
- **Primary Actions:**
  - "Approve Request"
  - "Reject Request"
  - "View Details"
  - "Cancel Request"
  - "New Request"
  
- **Secondary Actions:**
  - "Try Again"
  - "Close"
  - "Sign Out"

### Status Labels
- "Pending Review"
- "Approved"
- "Rejected"
- "Cancelled"

### Empty States
- Manager: "All caught up! No pending approvals at the moment."
- User: "No requests yet. Create your first visitor request to get started."

### Error Messages
- "Oops! Something went wrong"
- "Unable to load your profile data"
- "Failed to load approvals. Please try again."

---

## 8. Responsive Behavior

### Desktop (≥768px)
- Drawer: 420px width, slide from right
- List items: full card layout
- 3-column KPI grid

### Tablet (768px - 1024px)
- Drawer: 380px width
- List items: compact card
- 3-column KPI grid

### Mobile (<768px)
- Full-screen page
- List items: stacked layout
- 1-column KPI grid
- Bottom sheet for modals

---

## 9. Accessibility

- **Keyboard Navigation:**
  - Tab through all interactive elements
  - ESC to close drawer/modal
  - Enter to activate buttons

- **Screen Readers:**
  - Proper ARIA labels
  - Role="dialog" for modals
  - Live regions for status updates

- **Focus Management:**
  - Focus trap in drawer/modal
  - Return focus to avatar on close

---

## 10. Animation Timing

- Drawer slide-in: 300ms ease-out
- Modal fade-in: 200ms ease-in-out
- Button hover: 150ms ease-in-out
- Status chip pulse: 2s infinite
- Skeleton shimmer: 1.5s infinite

---

## Implementation Priority

### Phase 1 (MVP)
1. Profile drawer structure
2. Basic user info display
3. Role detection logic
4. Pending approvals list (Manager)
5. My requests list (User)
6. Sign out functionality

### Phase 2
1. Request detail modal
2. Approve/Reject actions
3. Search & filter
4. Empty states

### Phase 3
1. Loading states
2. Error handling
3. Animations & transitions
4. Mobile optimization

---

**Design System Alignment:**
- Colors: Use existing primary (#e63223), slate palette
- Typography: Inter font family
- Spacing: 4px base unit (Tailwind default)
- Shadows: Subtle, layered approach
- Border radius: 0.5rem (lg), 0.75rem (xl)
