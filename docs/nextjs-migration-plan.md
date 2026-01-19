# Access Gate App - Next.js Migration Plan
## Migration from Vanilla HTML/JS to Next.js with Mock Mode

---

## 📋 Project Overview

**Current State:**
- Vanilla HTML/JS/CSS application
- Express backend serving static files
- Multiple pages: home.html, request.html, checkin.html, all-requests.html
- Tailwind CSS via CDN
- Material Icons
- User profile drawer component
- Quick navigation menu

**Target State:**
- Next.js 14+ App Router
- TypeScript
- Tailwind CSS (configured)
- Mock mode for Vercel deployment
- API wrapper for future backend integration
- Responsive design maintained
- All existing features preserved

---

## 🎯 Migration Strategy

### Phase 1: Setup Next.js Project Structure
1. Create new Next.js app with TypeScript
2. Configure Tailwind CSS
3. Setup environment variables
4. Create folder structure

### Phase 2: Create Core Infrastructure
1. API wrapper (`lib/api.ts`)
2. Mock data (`lib/mock.ts`)
3. Type definitions (`types/`)
4. Utility functions (`lib/utils.ts`)

### Phase 3: Migrate Components
1. Layout component (header, navigation)
2. User profile drawer
3. Quick navigation menu
4. Reusable UI components (cards, buttons, forms)

### Phase 4: Migrate Pages
1. Dashboard (home)
2. New Request (request)
3. Check-in Console (checkin)
4. All Requests (all-requests)
5. Mock Demo page

### Phase 5: Testing & Deployment
1. Local testing
2. Build verification
3. Vercel deployment
4. Documentation

---

## 📁 New Folder Structure

```
access-gate-nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with header
│   │   ├── page.tsx                   # Dashboard (home)
│   │   ├── request/
│   │   │   └── page.tsx              # New Request page
│   │   ├── checkin/
│   │   │   └── page.tsx              # Check-in Console
│   │   ├── all-requests/
│   │   │   └── page.tsx              # All Requests page
│   │   └── mock-demo/
│   │       └── page.tsx              # Mock demo page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── QuickNavigation.tsx
│   │   │   └── UserProfile.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   └── features/
│   │       ├── dashboard/
│   │       ├── request/
│   │       ├── checkin/
│   │       └── all-requests/
│   ├── lib/
│   │   ├── api.ts                    # API wrapper with mock mode
│   │   ├── mock.ts                   # Mock data
│   │   └── utils.ts                  # Utility functions
│   ├── types/
│   │   ├── request.ts
│   │   ├── user.ts
│   │   └── index.ts
│   └── styles/
│       └── globals.css               # Tailwind + custom styles
├── public/
│   └── assets/
│       └── images/
│           └── logo.png
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🔧 Implementation Details

### 1. Environment Variables

**.env.example:**
```env
# Mock Mode Configuration
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_BASE_URL=

# App Configuration
NEXT_PUBLIC_APP_NAME=Access Gate System
NEXT_PUBLIC_APP_VERSION=2.0.0
```

**.env.local (for development):**
```env
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_BASE_URL=
```

### 2. API Wrapper (`lib/api.ts`)

**Features:**
- Automatic mock/real mode switching
- Type-safe responses
- Error handling
- Loading states
- Server/Client component compatible

**Methods:**
```typescript
apiGet<T>(path: string): Promise<T>
apiPost<T>(path: string, body: any): Promise<T>
apiPut<T>(path: string, body: any): Promise<T>
apiDelete<T>(path: string): Promise<T>
```

### 3. Mock Data (`lib/mock.ts`)

**Endpoints:**
```typescript
/api/requests          // All requests
/api/requests/:id      // Single request
/api/profile           // User profile
/api/kpi               // Dashboard KPIs
/api/visitors          // Visitors list
/api/checkin           // Check-in data
```

**Data Structure:**
- Realistic sample data
- Proper TypeScript types
- Relationships between entities
- Multiple sites/plants

### 4. Type Definitions

**Request Types:**
```typescript
interface Request {
  id: string;
  site_id: string;
  type: 'visitor' | 'contractor' | 'goods' | 'tools';
  status: 'pending' | 'approved' | 'rejected' | 'checked_in' | 'checked_out';
  created_at: string;
  scheduled_at: string;
  visitor: VisitorInfo;
  visit: VisitDetails;
  approval?: ApprovalInfo;
}
```

---

## 🎨 Component Migration

### Header Component
- Responsive design
- Date/time display
- User profile trigger
- Notifications
- Dark mode toggle (future)

### User Profile Drawer
- Role-based content
- Approvals (Manager)
- Request history (User)
- Sign out

### Quick Navigation
- FAB menu
- Page shortcuts
- Active state

### Page Components
- Dashboard cards
- Request form
- Check-in table
- All requests table with filters

---

## 📦 Dependencies

**Core:**
- next: ^14.0.0
- react: ^18.0.0
- react-dom: ^18.0.0
- typescript: ^5.0.0

**UI:**
- tailwindcss: ^3.4.0
- @headlessui/react: ^1.7.0 (for modals, dropdowns)
- clsx: ^2.0.0 (for className management)

**Utilities:**
- date-fns: ^3.0.0 (for date formatting)
- zod: ^3.22.0 (for validation)

**Dev:**
- @types/node
- @types/react
- @types/react-dom
- eslint
- prettier

---

## 🚀 Deployment Steps

### Local Development
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

### Build & Test
```bash
npm run build
npm run start
# Verify production build
```

### Vercel Deployment
1. Push to GitHub
2. Import to Vercel
3. Set environment variables:
   - NEXT_PUBLIC_USE_MOCK=true
   - NEXT_PUBLIC_API_BASE_URL=(empty)
4. Deploy
5. Test /mock-demo

### Switch to Real Backend
1. Update env vars:
   - NEXT_PUBLIC_USE_MOCK=false
   - NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
2. Redeploy

---

## ✅ Migration Checklist

### Setup
- [ ] Create Next.js project
- [ ] Configure Tailwind CSS
- [ ] Setup TypeScript
- [ ] Create folder structure
- [ ] Setup environment variables

### Core Infrastructure
- [ ] API wrapper (lib/api.ts)
- [ ] Mock data (lib/mock.ts)
- [ ] Type definitions
- [ ] Utility functions

### Components
- [ ] Layout component
- [ ] Header component
- [ ] User Profile drawer
- [ ] Quick Navigation menu
- [ ] UI components (Button, Card, Input, Modal)

### Pages
- [ ] Dashboard (/)
- [ ] New Request (/request)
- [ ] Check-in Console (/checkin)
- [ ] All Requests (/all-requests)
- [ ] Mock Demo (/mock-demo)

### Features
- [ ] Request creation
- [ ] Request approval
- [ ] Check-in functionality
- [ ] Request filtering
- [ ] Search functionality
- [ ] Export CSV

### Testing
- [ ] Local dev server
- [ ] Production build
- [ ] Mock mode
- [ ] Real API mode (when ready)
- [ ] Responsive design
- [ ] Dark mode (future)

### Documentation
- [ ] README.md
- [ ] API documentation
- [ ] Deployment guide
- [ ] Environment variables guide

### Deployment
- [ ] Vercel configuration
- [ ] Environment variables
- [ ] Build verification
- [ ] Production testing

---

## 📝 Notes

### Preserved Features
- All existing pages and functionality
- User profile system
- Quick navigation
- Request management
- Check-in console
- Filtering and search
- Export functionality

### New Features
- TypeScript type safety
- Server-side rendering
- Better performance
- Mock mode for development
- Easier deployment
- Better code organization
- Reusable components

### Future Enhancements
- Dark mode
- Real-time updates (WebSocket)
- Offline support (PWA)
- Mobile app (React Native)
- Advanced analytics
- Multi-language support

---

## 🎯 Success Criteria

1. ✅ Next.js app runs locally
2. ✅ All pages migrated and functional
3. ✅ Mock mode works without backend
4. ✅ Builds successfully
5. ✅ Deploys to Vercel
6. ✅ /mock-demo shows data
7. ✅ Responsive design maintained
8. ✅ All features preserved
9. ✅ TypeScript no errors
10. ✅ Documentation complete

---

**Estimated Time:** 4-6 hours
**Complexity:** High
**Priority:** High
**Status:** Ready to implement

---

**Next Steps:**
1. Create Next.js project structure
2. Implement core infrastructure
3. Migrate components
4. Migrate pages
5. Test and deploy
