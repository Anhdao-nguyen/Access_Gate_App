# 📋 RBAC IMPLEMENTATION SUMMARY

## ✅ HOÀN TẤT - Role-Based Access Control (RBAC) Implementation

---

## 🎯 MỤC TIÊU ĐÃ ĐẠT ĐƯỢC

✅ Backend API authorization với role-based permission
✅ Data scope filtering theo role
✅ Frontend route guards với page access control
✅ Navigation menu filtering based on permissions
✅ Ownership checking cho CRUD operations

---

## 📂 CÁC FILE ĐÃ TẠO MỚI

### Backend:
1. **`src/config/roles.config.js`** - Role definitions & permission matrix
2. **`src/api/services/data-scope.service.js`** - Data filtering logic

### Frontend:
3. **`public/js/role-config.js`** - Frontend role configuration
4. **`public/js/quick-navigation-rbac.js`** - Role-aware navigation menu

---

## 📝 CÁC FILE ĐÃ CHỈNH SỬA

### Backend:
1. **`src/api/middleware/auth.middleware.js`** ✏️
   - Added: `authorizeOperation()`, `applyDataScope()`, `canModifyRequest()`
   - Added: `requireRoles()`, `fullAccessOnly()`, `guardsOnly()`, `guardsOrFullAccess()`
   - Enhanced: Role normalization

2. **`src/api/routes/visitor.routes.js`** ✏️
   - Changed ALL routes from `optionalAuth` → `authenticate` + proper authorization
   - Added `authorizeOperation()` middleware
   - Added `applyDataScope()` for data filtering
   - Added `canModifyRequest()` for ownership checks

3. **`src/api/routes/gate.routes.js`** ✏️
   - Changed from `optionalAuth` → `authenticate` + authorization
   - Added role-based access control for gate operations

4. **`src/api/controllers/visitor.controller.js`** ✏️
   - `getAll()`: Now applies data scope filtering
   - `getById()`: Now checks if user can view request
   - `update()`: Now checks ownership
   - `delete()`: Now checks ownership

5. **`src/api/repositories/visitor.repository.js`** ✏️
   - `findAll()`: Added support for `allowedStatuses[]` and `requestedByIds[]` filters

6. **`src/api/repositories/user.repository.js`** ✏️
   - `findAll()`: Added filters for `role`, `factoryId`, `managerId`

### Frontend:
7. **`public/js/auth-guard.js`** ✏️
   - Added: `checkPageAccess()` - Role-based page authorization
   - Added: `performPageAccessCheck()` - Validates role permissions
   - Added: `redirectToAllowedPage()` - Smart redirect based on role
   - Now enforces page access rules before loading page

---

## 🔐 MA TRẬN QUYỀN TRUY CẬP

### Role Groups:
```
FULL_ACCESS    = [admin, hse, receptionist, plant_manager]
CHECKIN_ONLY   = [guard]
LIMITED        = [user, manager]
```

### Page Access Matrix:
| Page              | admin | hse | receptionist | plant_manager | guard | manager | user |
|-------------------|-------|-----|--------------|---------------|-------|---------|------|
| Dashboard (home)  | ✅    | ✅  | ✅           | ✅            | ❌    | ✅      | ✅   |
| All Requests      | ✅    | ✅  | ✅           | ✅            | ❌    | ❌      | ❌   |
| Request (Create)  | ✅    | ✅  | ✅           | ✅            | ❌    | ✅      | ✅   |
| Checkin Console   | ✅    | ✅  | ✅           | ✅            | ✅    | ❌      | ❌   |
| Profile           | ✅    | ✅  | ✅           | ✅            | ✅    | ✅*     | ✅*  |

*Own profile only

---

## 🎯 DATA SCOPE RULES

### Full Access (admin, hse, receptionist, plant_manager):
- ✅ View ALL requests
- ✅ Modify ALL requests
- ✅ No data filtering

### Guard (bao_ve):
- ✅ View only requests with status: `ready`, `approved`, `checked_in`
- ❌ Cannot view requests in other statuses
- ✅ Can check-in/check-out visitors

### Manager:
- ✅ View only requests created by users with role = `user` (nhân viên)
- ❌ Cannot view requests from other managers or their own
- ✅ Can approve/reject requests
- ⚠️ Note: Future enhancement needed for manager_id relationship filtering

### User (nhân viên):
- ✅ View only OWN requests (where `requested_by` = current user ID)
- ✅ Create new requests
- ✅ Edit/Delete own pending requests
- ❌ Cannot view/modify requests from others

---

## 🔧 CÀI ĐẶT & SỬ DỤNG

### 1. Backend Setup:
File `src/config/roles.config.js` đã được tạo tự động. Không cần config thêm.

### 2. Frontend Setup:
**QUAN TRỌNG:** Cần update HTML pages để load `role-config.js`:

```html
<!-- Add này VÀO TẤT CẢ protected pages (home.html, checkin.html, request.html, all-requests.html) -->

<!-- Before </body> tag -->
<script src="/js/role-config.js"></script>
<script src="/js/auth-guard.js"></script>

<!-- Replace quick-navigation.js with RBAC version -->
<!-- OLD: <script src="/js/quick-navigation.js"></script> -->
<script src="/js/quick-navigation-rbac.js"></script>
```

### 3. Database Schema Verification:
Kiểm tra roles trong database có đúng không:
```sql
SELECT DISTINCT role FROM users;
```

Nếu có roles khác, cần update `roles.config.js` hoặc migrate data.

---

## ✅ TEST CASES & ACCEPTANCE CRITERIA

### Test Case 1: Role `guard` (Bảo vệ)
**Setup:** Login với user có role = `guard`

**Expected Results:**
- ✅ **CAN** access: `/checkin.html`
- ❌ **CANNOT** access: `/home.html`, `/request.html`, `/all-requests.html`
- ✅ Quick navigation menu: Chỉ hiển thị "Check-in Console"
- ✅ API `/api/v1/gates/:id/queue`: Chỉ thấy requests với status `ready`/`approved`/`checked_in`
- ❌ API `/api/v1/visitors`: Không có quyền list all
- ❌ API `/api/v1/dashboard/stats`: Không có quyền access

**Test Steps:**
1. Login as guard
2. Try to access `/home.html` → Should redirect to `/checkin.html` with alert
3. Try to access `/request.html` → Should redirect to `/checkin.html` with alert
4. Access `/checkin.html` → Should work ✅
5. Check quick nav menu → Should only show "Check-in Console"

---

### Test Case 2: Role `user` (Nhân viên)
**Setup:** Login với user có role = `user`, user_id = 5

**Expected Results:**
- ✅ **CAN** access: `/home.html`, `/request.html`
- ❌ **CANNOT** access: `/checkin.html`, `/all-requests.html`
- ✅ Quick navigation: Shows "Dashboard", "New Request"
- ✅ API `/api/v1/visitors`: CHỈ thấy requests where `requested_by = 5`
- ✅ Can create new requests
- ✅ Can edit/delete OWN pending requests
- ❌ Cannot view/edit requests của người khác (returns 403)

**Test Steps:**
1. Login as user (id=5)
2. Access `/home.html` → Works ✅
3. Access `/request.html` → Works ✅
4. Try to access `/checkin.html` → Redirected with alert ❌
5. Call GET `/api/v1/visitors` → Should only return requests where `requested_by=5`
6. Call GET `/api/v1/visitors/123` (request từ user khác) → Should return 403
7. Try to edit request của người khác → Should return 403

---

### Test Case 3: Role `manager`
**Setup:** Login với user có role = `manager`

**Expected Results:**
- ✅ **CAN** access: `/home.html`, `/request.html`
- ❌ **CANNOT** access: `/checkin.html`, `/all-requests.html`
- ✅ API `/api/v1/visitors`: CHỈ thấy requests where `requested_by` là user có role=`user`
- ✅ Can approve/reject requests
- ❌ Cannot see requests from other managers

**Test Steps:**
1. Login as manager
2. Access `/home.html` → Works ✅
3. Try to access `/all-requests.html` → Redirected ❌
4. Try to access `/checkin.html` → Redirected ❌
5. Call GET `/api/v1/visitors` → Should only show requests from role=user employees
6. Call POST `/api/v1/visitors/:id/approve` → Should work ✅

---

### Test Case 4: Role `admin` / `hse` / `receptionist` / `plant_manager` (Full Access)
**Setup:** Login với user có role = `admin` (hoặc hse, receptionist, plant_manager)

**Expected Results:**
- ✅ **CAN** access: ALL pages
- ✅ Quick navigation: Shows all menu items
- ✅ API `/api/v1/visitors`: See ALL requests (no filtering)
- ✅ Can view/edit/delete any request
- ✅ Can access all dashboard stats

**Test Steps:**
1. Login as admin
2. Access ALL pages → All should work ✅
3. Check quick nav → Should show all 4 items
4. Call GET `/api/v1/visitors` → Should return ALL requests
5. Call GET `/api/v1/visitors/:id` (any ID) → Should work
6. Edit/delete any request → Should work

---

## 🐛 TROUBLESHOOTING

### Issue 1: "RoleConfig is not defined"
**Cause:** `role-config.js` chưa được load trước `auth-guard.js`

**Fix:** Ensure trong HTML:
```html
<script src="/js/role-config.js"></script>  <!-- MUST be before auth-guard -->
<script src="/js/auth-guard.js"></script>
```

---

### Issue 2: Navigation menu vẫn hiển thị tất cả items
**Cause:** Đang dùng `quick-navigation.js` cũ thay vì version RBAC

**Fix:** Replace trong HTML:
```html
<!-- OLD -->
<script src="/js/quick-navigation.js"></script>

<!-- NEW -->
<script src="/js/quick-navigation-rbac.js"></script>
```

---

### Issue 3: API returns 401 "No token provided"
**Cause:** Frontend không gửi token trong header

**Fix:** Check `api-client.js` có set Authorization header:
```javascript
headers: {
    'Authorization': `Bearer ${token}`
}
```

---

### Issue 4: User role không khớp với database
**Cause:** Role naming mismatch (DB có 'guard' nhưng code expect 'bao_ve')

**Fix:** Role normalization đã được implement trong:
- Backend: `roles.config.js` → `normalizeRole()`
- Frontend: `role-config.js` → `normalizeRole()`

Roles được normalize automatically:
- `hse_user` → `hse`
- `le_tan` → `receptionist`
- `bao_ve` → `guard`

---

## 📊 API ENDPOINT CHANGES

### Before (INSECURE):
```javascript
// Anyone could access, even without authentication
router.get('/', optionalAuth, visitorController.getAll);
```

### After (SECURE):
```javascript
// Requires authentication + proper authorization + data scope filtering
router.get('/',
    authenticate,                      // Must have valid token
    authorizeOperation('visitors.list'), // Must have permission
    applyDataScope,                     // Apply role-based filtering
    visitorController.getAll
);
```

---

## 🔄 MIGRATION NOTES

### Nếu đang có users trong production:

1. **Check existing roles:**
   ```sql
   SELECT role, COUNT(*) FROM users GROUP BY role;
   ```

2. **Update roles nếu cần:**
   ```sql
   UPDATE users SET role = 'guard' WHERE role = 'bao_ve';
   UPDATE users SET role = 'receptionist' WHERE role = 'le_tan';
   ```

3. **Add missing roles:**
   ```sql
   ALTER TABLE users MODIFY role ENUM('admin', 'hse', 'receptionist', 'plant_manager', 'guard', 'manager', 'user');
   ```

---

## 📝 NEXT STEPS / FUTURE ENHANCEMENTS

### 1. Manager Hierarchy:
Hiện tại manager chỉ thấy requests từ role=user. Có thể enhance để:
- Manager chỉ thấy requests từ nhân viên trực thuộc (theo `manager_id`)
- Implement hierarchical permission structure

### 2. Audit Logging:
Add logging cho:
- Failed authorization attempts
- Data access violations
- Permission changes

### 3. Dynamic Permissions:
Move permissions từ code sang database để admin có thể configure qua UI

### 4. Access Denied Page:
Tạo page `/access-denied.html` với UI đẹp thay vì dùng `alert()`

---

## 🎓 DEVELOPER NOTES

### Adding a New Role:

1. Update `src/config/roles.config.js`:
   ```javascript
   const ROLES = {
       // ... existing roles
       NEW_ROLE: 'new_role'
   };
   ```

2. Add to appropriate group:
   ```javascript
   const ROLE_GROUPS = {
       FULL_ACCESS: [..., 'new_role'],
       // or
       LIMITED: [..., 'new_role']
   };
   ```

3. Update page permissions:
   ```javascript
   const PAGE_PERMISSIONS = {
       'some-page': [..., 'new_role']
   };
   ```

4. Update frontend `public/js/role-config.js` accordingly

5. Update database ENUM if needed

---

### Adding a New Protected Page:

1. Add to `PAGE_PERMISSIONS` in both backend and frontend configs
2. Include auth scripts in HTML:
   ```html
   <script src="/js/role-config.js"></script>
   <script src="/js/auth-guard.js"></script>
   ```
3. Test with different roles!

---

## ✅ CHECKLIST TRƯỚC KHI DEPLOY

- [ ] All HTML pages load `role-config.js` before `auth-guard.js`
- [ ] All HTML pages use `quick-navigation-rbac.js` instead of old version
- [ ] Database roles match config (admin, hse, receptionist, guard, user, manager, plant_manager)
- [ ] Test with EACH role (guard, user, manager, admin)
- [ ] Verify API returns 403 for unauthorized access
- [ ] Verify data scope filtering works (users only see their data)
- [ ] Check navigation menu filters correctly per role
- [ ] Test page redirects work (guards → checkin, others → home)

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Check browser console for errors
2. Check server logs for 403/401 errors
3. Verify user role in localStorage → currentUser → role
4. Test API endpoints với Postman/curl to isolate frontend vs backend issues

---

**Implementation Date:** 2026-02-05
**Version:** 1.0.0
**Status:** ✅ READY FOR TESTING
