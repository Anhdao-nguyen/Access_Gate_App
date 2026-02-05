# ACCESS GATE SYSTEM - API Backend Proposal

## 📋 Tổng quan

Đề xuất kiến trúc API Backend cho Access Gate System với khả năng mở rộng **multi-tenant** (nhiều nhà máy), hỗ trợ nhiều loại hoạt động ra/vào cổng.

---

## 🏗️ Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ACCESS GATE SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  FRONTEND (Current)     │  API GATEWAY          │  SERVICES               │
│  ─────────────────      │  ─────────────        │  ────────────────────   │
│  • home.html            │  • Authentication     │  • Visitor Service      │
│  • checkin.html         │  • Rate Limiting      │  • Contractor Service   │
│  • request.html         │  • Tenant Resolution  │  • RCN Service          │
│                         │  • Request Logging    │  • Equipment Service    │
│                         │                       │  • Gate Service         │
│                         │                       │  • Notification Service │
├─────────────────────────────────────────────────────────────────────────────┤
│                              DATABASE LAYER                                 │
│  ───────────────────────────────────────────────────────────────────────    │
│  PostgreSQL (Multi-tenant with tenant_id) + Redis (Cache/Session)          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (Multi-tenant)

### 1. Core Tables

```sql
-- =============================================
-- TENANT & ORGANIZATION
-- =============================================

-- Công ty/Tập đoàn (Level cao nhất)
CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,          -- "Intersnack Group"
    code            VARCHAR(50) UNIQUE NOT NULL,    -- "INTERSNACK"
    status          VARCHAR(20) DEFAULT 'active',   -- active, suspended
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Nhà máy/Factory (Tenant)
CREATE TABLE factories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID REFERENCES organizations(id),
    name            VARCHAR(255) NOT NULL,          -- "Intersnack Binh Duong"
    code            VARCHAR(50) UNIQUE NOT NULL,    -- "ISK-BD"
    address         TEXT,
    timezone        VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    settings        JSONB DEFAULT '{}',             -- Factory-specific settings
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Cổng bảo vệ trong nhà máy
CREATE TABLE gates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id      UUID REFERENCES factories(id) NOT NULL,
    name            VARCHAR(100) NOT NULL,          -- "Main Gate", "Gate 2"
    code            VARCHAR(20) NOT NULL,           -- "GATE-01"
    gate_type       VARCHAR(50) DEFAULT 'main',     -- main, secondary, emergency
    status          VARCHAR(20) DEFAULT 'active',
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(factory_id, code)
);

-- =============================================
-- USER & AUTHENTICATION
-- =============================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id      UUID REFERENCES factories(id),  -- NULL = org-level admin
    employee_id     VARCHAR(50),                    -- Mã nhân viên
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20),
    full_name       VARCHAR(255) NOT NULL,
    avatar_url      TEXT,
    password_hash   VARCHAR(255),
    role            VARCHAR(50) NOT NULL,           -- admin, manager, guard, staff
    department      VARCHAR(100),
    status          VARCHAR(20) DEFAULT 'active',
    last_login_at   TIMESTAMPTZ,
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Phân quyền chi tiết
CREATE TABLE user_permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    permission      VARCHAR(100) NOT NULL,          -- 'visitor.create', 'rcn.approve'
    gate_id         UUID REFERENCES gates(id),      -- NULL = all gates
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, permission, gate_id)
);
```

### 2. Access Request Tables

```sql
-- =============================================
-- VISITOR & PARTNER REQUESTS
-- =============================================

CREATE TABLE visitor_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id      UUID REFERENCES factories(id) NOT NULL,
    request_number  VARCHAR(50) NOT NULL,           -- "VR-2026-00001"

    -- Requester info
    requested_by    UUID REFERENCES users(id),
    requester_name  VARCHAR(255),
    requester_dept  VARCHAR(100),

    -- Visit details
    purpose         VARCHAR(100) NOT NULL,          -- meeting, delivery, inspection, interview
    access_area     VARCHAR(100) NOT NULL,          -- Office, Operation, Warehouse
    visit_date      DATE NOT NULL,
    start_time      TIME,
    end_time        TIME,
    host_contact    VARCHAR(255),                   -- Người tiếp đón
    notes           TEXT,

    -- Status workflow
    status          VARCHAR(30) DEFAULT 'pending',  -- pending, approved, rejected, cancelled, completed
    approved_by     UUID REFERENCES users(id),
    approved_at     TIMESTAMPTZ,
    rejection_reason TEXT,

    -- Metadata
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(factory_id, request_number)
);

-- Chi tiết từng visitor trong request
CREATE TABLE visitors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id      UUID REFERENCES visitor_requests(id) ON DELETE CASCADE,

    -- Personal info
    full_name       VARCHAR(255) NOT NULL,
    company         VARCHAR(255),
    id_card         VARCHAR(50),                    -- CMND/CCCD/Passport
    phone           VARCHAR(20),
    email           VARCHAR(255),
    photo_url       TEXT,

    -- PPE requirements
    ppe_hairnet     BOOLEAN DEFAULT FALSE,
    ppe_safety_shoes BOOLEAN DEFAULT FALSE,
    shoe_size       VARCHAR(10),

    -- Badge info (sau khi check-in)
    badge_number    VARCHAR(20),
    badge_issued_at TIMESTAMPTZ,
    badge_returned_at TIMESTAMPTZ,

    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONTRACTOR REQUESTS (Nhà thầu dài hạn)
-- =============================================

CREATE TABLE contractor_companies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id      UUID REFERENCES factories(id) NOT NULL,
    company_name    VARCHAR(255) NOT NULL,
    tax_code        VARCHAR(50),
    contact_person  VARCHAR(255),
    contact_phone   VARCHAR(20),
    contact_email   VARCHAR(255),
    address         TEXT,
    status          VARCHAR(20) DEFAULT 'active',
    documents       JSONB DEFAULT '[]',             -- Hợp đồng, giấy phép...
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contractor_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id      UUID REFERENCES factories(id) NOT NULL,
    company_id      UUID REFERENCES contractor_companies(id),
    request_number  VARCHAR(50) NOT NULL,           -- "CR-2026-00001"

    -- Work details
    work_description TEXT NOT NULL,
    work_area       VARCHAR(100) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    work_permit_no  VARCHAR(50),                    -- Giấy phép làm việc

    -- Safety requirements
    safety_induction BOOLEAN DEFAULT FALSE,         -- Đã huấn luyện ATLĐ
    insurance_valid BOOLEAN DEFAULT FALSE,          -- Bảo hiểm còn hiệu lực

    -- Status
    status          VARCHAR(30) DEFAULT 'pending',
    approved_by     UUID REFERENCES users(id),
    approved_at     TIMESTAMPTZ,

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(factory_id, request_number)
);

CREATE TABLE contractor_workers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id      UUID REFERENCES contractor_requests(id) ON DELETE CASCADE,

    full_name       VARCHAR(255) NOT NULL,
    id_card         VARCHAR(50),
    phone           VARCHAR(20),
    job_title       VARCHAR(100),                   -- Thợ điện, thợ hàn...
    certifications  JSONB DEFAULT '[]',             -- Chứng chỉ nghề

    -- PPE
    ppe_required    JSONB DEFAULT '[]',             -- ['helmet', 'safety_shoes', 'vest']

    -- Badge
    badge_number    VARCHAR(20),
    badge_valid_from DATE,
    badge_valid_to  DATE,

    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RCN - GOODS IN/OUT
-- =============================================

CREATE TABLE rcn_tickets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id      UUID REFERENCES factories(id) NOT NULL,
    ticket_number   VARCHAR(50) NOT NULL,           -- "RCN-2026-00001"

    -- Type
    direction       VARCHAR(10) NOT NULL,           -- 'in' or 'out'
    rcn_type        VARCHAR(50) NOT NULL,           -- material, product, sample, return, other

    -- Logistics info
    supplier_customer VARCHAR(255),                 -- Nhà cung cấp/Khách hàng
    po_number       VARCHAR(50),                    -- Purchase Order
    do_number       VARCHAR(50),                    -- Delivery Order
    invoice_number  VARCHAR(50),

    -- Vehicle info
    vehicle_plate   VARCHAR(20),
    driver_name     VARCHAR(255),
    driver_id_card  VARCHAR(50),
    driver_phone    VARCHAR(20),

    -- Gate assignment
    assigned_gate   UUID REFERENCES gates(id),
    expected_time   TIMESTAMPTZ,

    -- Status
    status          VARCHAR(30) DEFAULT 'pending',  -- pending, approved, in_progress, completed, cancelled

    -- Approval
    requested_by    UUID REFERENCES users(id),
    approved_by     UUID REFERENCES users(id),
    approved_at     TIMESTAMPTZ,

    -- Timestamps
    arrival_time    TIMESTAMPTZ,
    departure_time  TIMESTAMPTZ,

    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(factory_id, ticket_number)
);

CREATE TABLE rcn_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rcn_id          UUID REFERENCES rcn_tickets(id) ON DELETE CASCADE,

    item_code       VARCHAR(50),
    item_name       VARCHAR(255) NOT NULL,
    quantity        DECIMAL(10,2) NOT NULL,
    unit            VARCHAR(20),                    -- kg, pcs, carton, pallet
    lot_number      VARCHAR(50),
    remarks         TEXT,

    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EQUIPMENT IN/OUT
-- =============================================

CREATE TABLE equipment_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id      UUID REFERENCES factories(id) NOT NULL,
    request_number  VARCHAR(50) NOT NULL,           -- "EQ-2026-00001"

    direction       VARCHAR(10) NOT NULL,           -- 'in' or 'out'

    -- Equipment details
    equipment_name  VARCHAR(255) NOT NULL,
    equipment_type  VARCHAR(100),                   -- laptop, tool, machine
    serial_number   VARCHAR(100),
    brand_model     VARCHAR(255),

    -- Owner info
    owner_type      VARCHAR(50) NOT NULL,           -- employee, visitor, contractor
    owner_name      VARCHAR(255) NOT NULL,
    owner_company   VARCHAR(255),
    owner_id_card   VARCHAR(50),

    -- Purpose
    purpose         TEXT,
    expected_return_date DATE,                      -- Nếu direction = 'in'

    -- Status
    status          VARCHAR(30) DEFAULT 'pending',
    approved_by     UUID REFERENCES users(id),
    approved_at     TIMESTAMPTZ,

    -- Actual times
    actual_in_time  TIMESTAMPTZ,
    actual_out_time TIMESTAMPTZ,

    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(factory_id, request_number)
);

-- =============================================
-- CHECK-IN/CHECK-OUT LOG (Core Activity Log)
-- =============================================

CREATE TABLE access_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id      UUID REFERENCES factories(id) NOT NULL,
    gate_id         UUID REFERENCES gates(id) NOT NULL,

    -- Reference to source
    access_type     VARCHAR(50) NOT NULL,           -- visitor, contractor, rcn, equipment, employee
    reference_id    UUID,                           -- ID của visitor/contractor/rcn...
    reference_number VARCHAR(50),                   -- VR-2026-001, CR-2026-001...

    -- Person/Vehicle info
    person_name     VARCHAR(255),
    person_id_card  VARCHAR(50),
    person_company  VARCHAR(255),
    vehicle_plate   VARCHAR(20),

    -- Badge
    badge_number    VARCHAR(20),

    -- Activity
    action          VARCHAR(20) NOT NULL,           -- check_in, check_out
    action_time     TIMESTAMPTZ DEFAULT NOW(),

    -- Guard info
    processed_by    UUID REFERENCES users(id),

    -- Additional data
    photo_url       TEXT,                           -- Ảnh chụp khi check-in
    signature_url   TEXT,                           -- Chữ ký điện tử
    notes           TEXT,

    created_at      TIMESTAMPTZ DEFAULT NOW(),

    -- Index for fast queries
    INDEX idx_access_logs_factory_date (factory_id, action_time DESC)
);

-- =============================================
-- NOTIFICATIONS & ALERTS
-- =============================================

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id      UUID REFERENCES factories(id),
    user_id         UUID REFERENCES users(id),      -- NULL = broadcast

    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    type            VARCHAR(50) NOT NULL,           -- info, warning, alert, approval_request

    -- Reference
    reference_type  VARCHAR(50),                    -- visitor_request, rcn_ticket...
    reference_id    UUID,

    -- Status
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMPTZ,

    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Overstay alerts
CREATE TABLE overstay_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id      UUID REFERENCES factories(id) NOT NULL,
    access_log_id   UUID REFERENCES access_logs(id),

    person_name     VARCHAR(255),
    expected_out    TIMESTAMPTZ,
    alert_level     VARCHAR(20) DEFAULT 'warning', -- warning, critical
    is_resolved     BOOLEAN DEFAULT FALSE,
    resolved_at     TIMESTAMPTZ,
    resolved_by     UUID REFERENCES users(id),

    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### Base URL Structure
```
/api/v1/{tenant_code}/...
```

Ví dụ: `/api/v1/ISK-BD/visitors` cho nhà máy Intersnack Bình Dương

### 1. Authentication & User

```
POST   /api/v1/auth/login              # Đăng nhập
POST   /api/v1/auth/logout             # Đăng xuất
POST   /api/v1/auth/refresh            # Refresh token
GET    /api/v1/auth/me                 # Thông tin user hiện tại

GET    /api/v1/{tenant}/users          # Danh sách users (admin)
POST   /api/v1/{tenant}/users          # Tạo user mới
GET    /api/v1/{tenant}/users/:id      # Chi tiết user
PUT    /api/v1/{tenant}/users/:id      # Cập nhật user
DELETE /api/v1/{tenant}/users/:id      # Xóa user
```

### 2. Visitor Requests

```
GET    /api/v1/{tenant}/visitors                    # Danh sách requests
POST   /api/v1/{tenant}/visitors                    # Tạo request mới
GET    /api/v1/{tenant}/visitors/:id                # Chi tiết request
PUT    /api/v1/{tenant}/visitors/:id                # Cập nhật request
DELETE /api/v1/{tenant}/visitors/:id                # Xóa request

POST   /api/v1/{tenant}/visitors/:id/approve        # Duyệt request
POST   /api/v1/{tenant}/visitors/:id/reject         # Từ chối request
POST   /api/v1/{tenant}/visitors/:id/cancel         # Hủy request

# Visitor trong request
GET    /api/v1/{tenant}/visitors/:id/persons        # Danh sách visitors
POST   /api/v1/{tenant}/visitors/:id/persons        # Thêm visitor
PUT    /api/v1/{tenant}/visitors/:id/persons/:pid   # Cập nhật visitor
DELETE /api/v1/{tenant}/visitors/:id/persons/:pid   # Xóa visitor
```

### 3. Contractor Requests

```
# Contractor Companies
GET    /api/v1/{tenant}/contractors/companies       # Danh sách công ty nhà thầu
POST   /api/v1/{tenant}/contractors/companies       # Thêm công ty
GET    /api/v1/{tenant}/contractors/companies/:id   # Chi tiết công ty
PUT    /api/v1/{tenant}/contractors/companies/:id   # Cập nhật công ty

# Contractor Requests
GET    /api/v1/{tenant}/contractors                 # Danh sách requests
POST   /api/v1/{tenant}/contractors                 # Tạo request
GET    /api/v1/{tenant}/contractors/:id             # Chi tiết
PUT    /api/v1/{tenant}/contractors/:id             # Cập nhật
POST   /api/v1/{tenant}/contractors/:id/approve     # Duyệt
POST   /api/v1/{tenant}/contractors/:id/reject      # Từ chối

# Workers trong request
GET    /api/v1/{tenant}/contractors/:id/workers     # Danh sách workers
POST   /api/v1/{tenant}/contractors/:id/workers     # Thêm worker
```

### 4. RCN (Goods In/Out)

```
GET    /api/v1/{tenant}/rcn                         # Danh sách RCN tickets
POST   /api/v1/{tenant}/rcn                         # Tạo RCN mới
GET    /api/v1/{tenant}/rcn/:id                     # Chi tiết RCN
PUT    /api/v1/{tenant}/rcn/:id                     # Cập nhật RCN
POST   /api/v1/{tenant}/rcn/:id/approve             # Duyệt RCN
POST   /api/v1/{tenant}/rcn/:id/complete            # Hoàn thành RCN

# RCN Items
GET    /api/v1/{tenant}/rcn/:id/items               # Danh sách items
POST   /api/v1/{tenant}/rcn/:id/items               # Thêm item
PUT    /api/v1/{tenant}/rcn/:id/items/:iid          # Cập nhật item
```

### 5. Equipment

```
GET    /api/v1/{tenant}/equipment                   # Danh sách requests
POST   /api/v1/{tenant}/equipment                   # Tạo request
GET    /api/v1/{tenant}/equipment/:id               # Chi tiết
PUT    /api/v1/{tenant}/equipment/:id               # Cập nhật
POST   /api/v1/{tenant}/equipment/:id/approve       # Duyệt
```

### 6. Gate Operations (Check-in Console)

```
# Access Logs
GET    /api/v1/{tenant}/gates/:gateId/queue         # Danh sách chờ check-in
GET    /api/v1/{tenant}/gates/:gateId/active        # Đang ở trong nhà máy
GET    /api/v1/{tenant}/gates/:gateId/logs          # Lịch sử ra/vào

# Check-in/out operations
POST   /api/v1/{tenant}/gates/:gateId/checkin       # Check-in
POST   /api/v1/{tenant}/gates/:gateId/checkout      # Check-out

# Quick search (for guards)
GET    /api/v1/{tenant}/gates/:gateId/search        # Tìm theo tên/ID/biển số
```

### 7. Dashboard & Reports

```
GET    /api/v1/{tenant}/dashboard/stats             # Thống kê tổng quan
GET    /api/v1/{tenant}/dashboard/today             # Hoạt động hôm nay
GET    /api/v1/{tenant}/dashboard/alerts            # Cảnh báo (overstay...)

GET    /api/v1/{tenant}/reports/visitors            # Báo cáo visitors
GET    /api/v1/{tenant}/reports/contractors         # Báo cáo contractors
GET    /api/v1/{tenant}/reports/rcn                 # Báo cáo RCN
GET    /api/v1/{tenant}/reports/access-logs         # Báo cáo ra/vào
```

### 8. Notifications

```
GET    /api/v1/{tenant}/notifications               # Danh sách thông báo
PUT    /api/v1/{tenant}/notifications/:id/read      # Đánh dấu đã đọc
PUT    /api/v1/{tenant}/notifications/read-all      # Đọc tất cả
```

---

## 📁 Folder Structure (Đề xuất)

```
src/
├── api/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── visitor.controller.js
│   │   ├── contractor.controller.js
│   │   ├── rcn.controller.js
│   │   ├── equipment.controller.js
│   │   ├── gate.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js          # JWT verification
│   │   ├── tenant.middleware.js        # Tenant resolution
│   │   ├── permission.middleware.js    # Role-based access
│   │   ├── validate.middleware.js      # Request validation
│   │   └── error.middleware.js         # Error handling
│   │
│   ├── models/
│   │   ├── index.js                    # Sequelize/Prisma setup
│   │   ├── organization.model.js
│   │   ├── factory.model.js
│   │   ├── gate.model.js
│   │   ├── user.model.js
│   │   ├── visitor-request.model.js
│   │   ├── visitor.model.js
│   │   ├── contractor-request.model.js
│   │   ├── contractor-worker.model.js
│   │   ├── rcn-ticket.model.js
│   │   ├── rcn-item.model.js
│   │   ├── equipment-request.model.js
│   │   ├── access-log.model.js
│   │   └── notification.model.js
│   │
│   ├── routes/
│   │   ├── index.js                    # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── visitor.routes.js
│   │   ├── contractor.routes.js
│   │   ├── rcn.routes.js
│   │   ├── equipment.routes.js
│   │   ├── gate.routes.js
│   │   └── dashboard.routes.js
│   │
│   └── services/
│       ├── auth.service.js
│       ├── visitor.service.js
│       ├── contractor.service.js
│       ├── rcn.service.js
│       ├── equipment.service.js
│       ├── gate.service.js
│       ├── notification.service.js
│       ├── report.service.js
│       └── number-generator.service.js # Auto-generate request numbers
│
├── config/
│   ├── database.js
│   ├── redis.js
│   ├── jwt.js
│   └── app.js
│
├── constants/
│   ├── status.js                       # Status enums
│   ├── permissions.js                  # Permission definitions
│   └── messages.js                     # Response messages
│
└── utils/
    ├── logger.js
    ├── response.js                     # Standard API response
    ├── pagination.js
    └── validators/
        ├── visitor.validator.js
        ├── contractor.validator.js
        └── rcn.validator.js
```

---

## 🔐 Authentication Flow

```
1. Login: POST /api/v1/auth/login
   Request:  { email, password, factory_code }
   Response: { access_token, refresh_token, user, factory }

2. Every API request:
   Header: Authorization: Bearer {access_token}

3. Tenant Resolution:
   - URL-based: /api/v1/{tenant_code}/...
   - Extracted from JWT token
   - Validated against user's permissions
```

---

## 📊 Response Format (Chuẩn hóa)

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": [
      { "field": "email", "message": "Email không đúng định dạng" }
    ]
  }
}
```

---

## 🚀 Implementation Priority

### Phase 1: Core (MVP)
1. ✅ Authentication (Login/Logout)
2. ✅ User management (basic)
3. ✅ Visitor Requests (full CRUD + approval)
4. ✅ Gate Check-in/Check-out
5. ✅ Basic Dashboard

### Phase 2: Extended
1. Contractor management
2. RCN tickets
3. Equipment tracking
4. Notifications
5. Reports

### Phase 3: Advanced
1. Multi-factory support
2. Advanced permissions
3. Integrations (CCTV, Badge printer)
4. Mobile app API
5. Analytics & BI

---

## 🛠️ Tech Stack Recommendations

| Component | Recommendation | Alternative |
|-----------|----------------|-------------|
| **Runtime** | Node.js 20 LTS | - |
| **Framework** | Express.js | Fastify |
| **ORM** | Prisma | Sequelize |
| **Database** | PostgreSQL | MySQL |
| **Cache** | Redis | - |
| **Auth** | JWT + bcrypt | Passport.js |
| **Validation** | Zod | Joi |
| **Documentation** | Swagger/OpenAPI | - |
| **Testing** | Jest | Vitest |

---

## 📝 Next Steps

1. **Thiết lập Database**: Tạo PostgreSQL database và chạy migrations
2. **Setup Prisma/Sequelize**: Định nghĩa models
3. **Implement Auth**: Login/logout flow
4. **Visitor API**: CRUD + approval workflow
5. **Gate API**: Check-in/out operations
6. **Connect Frontend**: Integrate với UI hiện tại

Bạn muốn tôi bắt đầu implement phần nào trước?
