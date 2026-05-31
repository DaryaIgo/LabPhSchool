# LabPhSchool — Implementation Plan

## Document: IMPL-PLAN-001
## Date: 2026-05-31
## Status: APPROVED
## Duration: 8 Weeks

---

## 1. Overview

This document outlines the phased implementation of the Authentication & Authorization system for LabPhSchool. The plan is divided into 8 weekly sprints, each delivering incremental, testable functionality.

**MVP Philosophy:** Each sprint delivers a working, deployable increment. No sprint ends with broken functionality.

---

## 2. Phase Breakdown

### ━━ Phase 1: Foundation (Week 1-2) ━━

#### Week 1: Database Foundation & Schema Migration

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Create `roles` and `permissions` tables | Schema + seed data |
| 1-2 | Create `role_permissions` junction table | Initial role-permission mappings |
| 2-3 | Update `users` table (add `roleId` FK, migrate existing data) | Migration + data integrity check |
| 3-4 | Create `local_users` table (successor to `students`) | Schema with indexes |
| 4-5 | Migrate existing `students` data to `local_users` | Data migration script + verification |

**Acceptance Criteria:**
- [ ] All tables created in MySQL
- [ ] Roles and permissions seeded
- [ ] Existing users migrated with correct roles
- [ ] Existing students migrated with passwords intact
- [ ] `npm run db:migrate` runs successfully
- [ ] All foreign key constraints verified

**Files touched:**
- `db/schema.ts` — New tables
- `db/relations.ts` — New relations
- `db/migrations/` — Migration files
- `db/seed.ts` — Updated seed script

---

#### Week 2: Core Auth Infrastructure

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Install `bcryptjs` dependency | `package.json` updated |
| 1-2 | Implement `PasswordService` (bcrypt hash/compare) | `api/lib/password.ts` |
| 2-3 | Refactor student-session to use HttpOnly cookies | `api/student-session.ts` updated |
| 3-4 | Update tRPC context builder (unified auth) | `api/context.ts` refactored |
| 4-5 | Implement unified auth router | `api/unified-auth-router.ts` |

**Acceptance Criteria:**
- [ ] bcrypt password hashing works (cost 12)
- [ ] Student JWT stored in HttpOnly cookie
- [ ] Context correctly resolves both OAuth and local users
- [ ] Unified login endpoint accepts student credentials
- [ ] Logout clears all relevant cookies
- [ ] Unit tests for PasswordService pass

**Files touched:**
- `package.json` — Add bcryptjs
- `api/lib/password.ts` — NEW
- `api/lib/cookies.ts` — Updated for student cookies
- `api/student-session.ts` — Refactored
- `api/context.ts` — Refactored
- `api/unified-auth-router.ts` — NEW

---

### ━━ Phase 2: RBAC Engine (Week 3-4) ━━

#### Week 3: RBAC Middleware & Authorization

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Implement role query functions | `api/queries/roles.ts` |
| 1-2 | Create `requirePermission` middleware factory | `api/middleware.ts` updated |
| 2-3 | Refactor existing middleware (public/authed/admin/student) | `api/middleware.ts` |
| 3-4 | Implement enrollment checking utilities | `api/queries/enrollments.ts` |
| 4-5 | Add audit logging service | `api/services/audit.ts` |

**Acceptance Criteria:**
- [ ] Role with permissions loads correctly for both user types
- [ ] `adminQuery` rejects non-admin users with 403
- [ ] `studentQuery` rejects non-students with 403
- [ ] `requirePermission()` middleware works for fine-grained control
- [ ] Enrollment check validates topic access
- [ ] Audit log entries created for significant actions
- [ ] All middleware unit tests pass

**Files touched:**
- `api/queries/roles.ts` — NEW
- `api/queries/enrollments.ts` — NEW
- `api/middleware.ts` — Refactored
- `api/services/audit.ts` — NEW
- `contracts/errors.ts` — Updated error types

---

#### Week 4: API Router Enhancement

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Refactor `student-router.ts` (unified auth, bcrypt, CRUD) | Full CRUD operations |
| 2-3 | Refactor `admin-router.ts` (permission checks, audit log) | Permission-protected CMS |
| 3-4 | Create `audit-router.ts` (admin-only audit log viewing) | Paginated audit queries |
| 4-5 | Wire all routers in `router.ts` + type check | Zero TypeScript errors |

**Acceptance Criteria:**
- [ ] `student.create` uses bcrypt hashing
- [ ] `student.update` supports name/status changes
- [ ] `admin.*` endpoints check specific permissions
- [ ] `audit.list` returns paginated results
- [ ] All endpoints use Zod validation
- [ ] All endpoints create audit log entries
- [ ] `npm run check` passes with zero errors

**Files touched:**
- `api/student-router.ts` — Refactored
- `api/admin-router.ts` — Refactored
- `api/audit-router.ts` — NEW
- `api/router.ts` — Updated

---

### ━━ Phase 3: Student Dashboard (Week 5) ━━

#### Week 5: Student Space Implementation

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Refactor `useStudentAuth` hook (HttpOnly cookies) | `src/hooks/useStudentAuth.ts` |
| 1-2 | Create student dashboard layout | `src/components/StudentLayout.tsx` |
| 2-3 | Build dashboard overview page | `src/pages/StudentDashboard.tsx` |
| 3-4 | Build topic progress view with enrollment filtering | Progress component |
| 4-5 | Build student profile page | `src/pages/StudentProfile.tsx` |

**Acceptance Criteria:**
- [ ] Student login uses unified auth endpoint
- [ ] Session stored in HttpOnly cookie (not localStorage)
- [ ] Dashboard shows enrolled topics only
- [ ] Progress bars reflect theory/practice/lab completion
- [ ] Profile page displays student info
- [ ] Logout clears session and redirects to login
- [ ] Unauthenticated access redirects to `/student/login`

**Files touched:**
- `src/hooks/useStudentAuth.ts` — Refactored
- `src/components/StudentLayout.tsx` — NEW
- `src/pages/StudentDashboard.tsx` — Updated
- `src/pages/StudentProfile.tsx` — Updated
- `src/providers/trpc.tsx` — Updated (remove x-student-token header)

---

### ━━ Phase 4: Admin Dashboard (Week 6-7) ━━

#### Week 6: Admin User Management GUI

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Create admin layout with navigation | `src/components/AdminLayout.tsx` |
| 1-2 | Build admin dashboard overview | `src/pages/admin/AdminDashboard.tsx` |
| 2-3 | Build student management list (CRUD table) | `src/pages/admin/StudentManagement.tsx` |
| 3-4 | Build student creation modal | CreateStudentModal component |
| 4-5 | Build student edit/suspend modal | EditStudentModal component |

**Acceptance Criteria:**
- [ ] Admin dashboard shows statistics (student count, active enrollments)
- [ ] Student table with pagination and search
- [ ] Create student form with validation
- [ ] Edit student (name, status)
- [ ] Suspend/activate student accounts
- [ ] Delete student with confirmation
- [ ] All operations call tRPC APIs with loading states
- [ ] Route guard redirects non-admin users

**Files touched:**
- `src/components/AdminLayout.tsx` — NEW
- `src/pages/admin/AdminDashboard.tsx` — NEW
- `src/pages/admin/StudentManagement.tsx` — NEW
- `src/components/CreateStudentModal.tsx` — NEW
- `src/components/EditStudentModal.tsx` — NEW
- `src/App.tsx` — Updated routes

---

#### Week 7: Admin CMS GUI

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Build topic management page | `src/pages/admin/TopicManagement.tsx` |
| 1-2 | Build subtopic management page | `src/pages/admin/SubtopicManagement.tsx` |
| 2-3 | Build lab management page | `src/pages/admin/LabManagement.tsx` |
| 3-4 | Build enrollment management | `src/pages/admin/EnrollmentManagement.tsx` |
| 4-5 | Build audit log viewer | `src/pages/admin/AuditLogViewer.tsx` |

**Acceptance Criteria:**
- [ ] Topic CRUD with form validation
- [ ] Subtopic CRUD with parent topic selection
- [ ] Lab CRUD with description editor
- [ ] Enrollment management (enroll/unenroll students)
- [ ] Audit log viewer with filters (actor, resource, date)
- [ ] All CMS operations are admin-only (403 for non-admins)
- [ ] Changes reflect immediately in student dashboard

**Files touched:**
- `src/pages/admin/TopicManagement.tsx` — NEW
- `src/pages/admin/SubtopicManagement.tsx` — NEW
- `src/pages/admin/LabManagement.tsx` — NEW
- `src/pages/admin/EnrollmentManagement.tsx` — NEW
- `src/pages/admin/AuditLogViewer.tsx` — NEW
- `src/App.tsx` — Updated routes

---

### ━━ Phase 5: Testing & Hardening (Week 8) ━━

#### Week 8: Testing, Security Audit & Deployment

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Write comprehensive tests | Test suite |
| 2-3 | Security audit (headers, cookies, RBAC) | Audit report |
| 3-4 | Performance testing (query optimization) | Performance report |
| 4-5 | Final review, PR creation | GitHub PR |

**Acceptance Criteria:**
- [ ] All auth flows tested (login, logout, unauthorized access)
- [ ] RBAC tested (admin access, student access, cross-role denial)
- [ ] Input validation tested (edge cases, injection attempts)
- [ ] Security headers verified
- [ ] Cookie attributes verified (httpOnly, secure, sameSite)
- [ ] No passwords in responses
- [ ] No sensitive data in error messages
- [ ] PR created with documentation

**Files touched:**
- `api/**/*.test.ts` — Test files
- `docs/architecture/` — Design documents
- `.github/pull_request_template.md` — PR template

---

## 3. Detailed Sprint Backlog

### Sprint 1: Database Foundation
```
[DB-001] Create roles table with seed data
[DB-002] Create permissions table with seed data
[DB-003] Create role_permissions junction table
[DB-004] Add roleId FK to users table
[DB-005] Create local_users table
[DB-006] Migrate students data to local_users
[DB-007] Create enrollments table
[DB-008] Create audit_log table
[DB-009] Write migration tests
```

### Sprint 2: Core Auth Infrastructure
```
[AUTH-001] Install bcryptjs, configure password service
[AUTH-002] Implement PasswordService with bcrypt
[AUTH-003] Refactor student session to HttpOnly cookies
[AUTH-004] Update tRPC context for unified auth
[AUTH-005] Implement unified auth router
[AUTH-006] Write auth service tests
```

### Sprint 3: RBAC Middleware
```
[RBAC-001] Implement role query functions
[RBAC-002] Create requirePermission middleware
[RBAC-003] Refactor existing middleware chain
[RBAC-004] Implement enrollment checking
[RBAC-005] Implement audit logging service
[RBAC-006] Write RBAC middleware tests
```

### Sprint 4: API Router Enhancement
```
[API-001] Refactor student router with unified auth
[API-002] Refactor admin router with permissions
[API-003] Create audit router
[API-004] Wire all routers
[API-005] Full TypeScript type check
[API-006] Write API integration tests
```

### Sprint 5: Student Dashboard
```
[UI-001] Refactor useStudentAuth hook
[UI-002] Create StudentLayout component
[UI-003] Build StudentDashboard page
[UI-004] Build progress visualization
[UI-005] Update StudentProfile page
[UI-006] Write component tests
```

### Sprint 6: Admin User Management
```
[UI-007] Create AdminLayout component
[UI-008] Build AdminDashboard page
[UI-009] Build StudentManagement page
[UI-010] Build CreateStudentModal
[UI-011] Build EditStudentModal
[UI-012] Write admin page tests
```

### Sprint 7: Admin CMS
```
[UI-013] Build TopicManagement page
[UI-014] Build SubtopicManagement page
[UI-015] Build LabManagement page
[UI-016] Build EnrollmentManagement page
[UI-017] Build AuditLogViewer page
[UI-018] Write CMS page tests
```

### Sprint 8: Testing & Deployment
```
[TEST-001] Auth flow end-to-end tests
[TEST-002] RBAC permission tests
[TEST-003] Input validation tests
[TEST-004] Security header verification
[TEST-005] Performance testing
[DEPLOY-001] Create GitHub PR
[DEPLOY-002] Write deployment documentation
```

---

## 4. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Data migration failure | Low | High | Full DB backup before migration; reversible scripts |
| bcrypt performance issues | Low | Medium | Cost factor 12 is standard; async hashing |
| Cookie issues cross-browser | Medium | Medium | Comprehensive browser testing in Week 8 |
| OAuth flow regression | Medium | High | Maintain backward compatibility; parallel testing |
| Permission complexity | Medium | Low | Clear permission naming; documentation |

---

## 5. Definition of Done

For each sprint to be considered complete:

1. All code written and committed
2. `npm run check` passes with zero TypeScript errors
3. New functionality manually tested
4. Relevant tests written and passing (`npm run test`)
5. Security review checklist completed
6. Documentation updated
7. PR ready for review
