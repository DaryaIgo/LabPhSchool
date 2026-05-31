# LabPhSchool — Backend Architecture

## Document: BE-ARCH-001
## Date: 2026-05-31
## Status: PROPOSED → IMPLEMENTED

---

## 1. Overview

The backend architecture implements a **unified authentication gateway** with **Role-Based Access Control (RBAC)** for the LabPhSchool Physics Education Platform. The system serves two primary roles: `student` and `admin` (teacher).

**Architecture Principles:**
- **Defense in depth**: Multiple layers of security (auth → RBAC → input validation)
- **Least privilege**: Each role has only the permissions it needs
- **Audit everything**: All significant actions are logged
- **Never trust the client**: All authorization decisions are server-side

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20+ |
| Framework | Hono | 4.x |
| API | tRPC | 11.x |
| Database | MySQL | 8.x |
| ORM | Drizzle ORM | latest |
| Auth | JWT (jose) | latest |
| Password Hashing | bcryptjs | 2.x |
| Validation | Zod | 3.x |
| Serialization | superjson | latest |

---

## 3. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React SPA)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  useAuth()   │  │ useStudent   │  │      trpc Client         │  │
│  │  (OAuth)     │  │   Auth()     │  │   (httpBatchLink +       │  │
│  │              │  │  (local)     │  │    credentials: include)  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                 │                       │                  │
│         │  JWT Cookie     │  JWT Cookie           │                  │
│         │  (httpOnly)     │  (httpOnly)           │                  │
│         ▼                 ▼                       ▼                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         HONO SERVER                                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    tRPC Router (appRouter)                    │  │
│  │                                                              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │  │
│  │  │  auth    │ │  student │ │  admin   │ │  course  │  ...  │  │
│  │  │  Router  │ │  Router  │ │  Router  │ │  Router  │       │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │  │
│  │       │            │            │            │              │  │
│  │  ┌────┴────────────┴────────────┴────────────┴──────────┐   │  │
│  │  │              Unified Context Builder                 │   │  │
│  │  │  (OAuth Cookie → user) OR (JWT Cookie → student)   │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  │                         │                                    │  │
│  │  ┌──────────────────────┴──────────────────────────────┐    │  │
│  │  │              Procedure Middleware Stack              │    │  │
│  │  │  publicQuery → authedQuery → adminQuery → permQuery │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                         │                                            │
│  ┌──────────────────────┴────────────────────────────────────────┐ │
│  │                    Service Layer                               │ │
│  │  AuthService    StudentService    AdminService    AuditService │ │
│  │       │               │               │              │        │ │
│  └───────┼───────────────┼───────────────┼──────────────┼────────┘ │
│          │               │               │              │           │
│  ┌───────┴───────────────┴───────────────┴──────────────┴────────┐ │
│  │                    Data Access Layer (Drizzle ORM)             │ │
│  │  Query Functions: findUserById, findLocalUserByLogin, ...     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                       │
│                              ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      MySQL 8 Database                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Authentication Architecture

### 4.1 Dual Authentication System

The platform uses two authentication mechanisms unified under a single context:

**1. OAuth 2.0 (Teachers/Admins):**
- Authorization via Kimi Platform
- Session stored in **httpOnly, SameSite=Lax, Secure** cookie (`auth_session`)
- JWT signed with APP_SECRET, 1-year expiry
- User identity resolved from JWT → database lookup

**2. Local Authentication (Students):**
- Username/password login
- Passwords hashed with **bcrypt** (cost 12)
- Session stored in **httpOnly, SameSite=Lax, Secure** cookie (`student_session`)
- JWT signed with APP_SECRET, 30-day expiry
- Identity resolved from JWT → database lookup

### 4.2 Unified Context Builder

```typescript
// api/context.ts
export async function createContext(opts): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try OAuth auth first (admin/teacher)
  const oauthUser = await resolveOAuthUser(opts.req);
  if (oauthUser) {
    ctx.user = oauthUser;
    ctx.role = await getRoleWithPermissions(oauthUser.roleId);
    return ctx;
  }

  // Try student auth (local JWT cookie)
  const studentUser = await resolveStudentUser(opts.req);
  if (studentUser) {
    ctx.localUser = studentUser;
    ctx.role = await getRoleWithPermissions(studentUser.roleId);
    return ctx;
  }

  return ctx; // Unauthenticated
}
```

### 4.3 Session Cookie Configuration

```typescript
// api/lib/cookies.ts
export function getSessionCookieOptions(headers: Headers) {
  const protocol = headers.get("x-forwarded-proto") ?? "http";
  const isSecure = protocol === "https";

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "Lax" as const,
    path: "/",
  };
}
```

Both session cookies use identical security attributes:
- **httpOnly**: Prevents JavaScript access (XSS protection)
- **secure**: HTTPS-only in production
- **sameSite: Lax**: CSRF protection (cookie not sent on cross-site POSTs)
- **path: "/"**: Available to all routes

---

## 5. RBAC Middleware Architecture

### 5.1 Procedure Types

```
┌─────────────────────────────────────────────────────────────────┐
│                    Procedure Type Hierarchy                      │
│                                                                  │
│  publicQuery ──► No authentication required                    │
│       │                                                          │
│       ▼                                                          │
│  authedQuery ──► Any authenticated user (OAuth or local)        │
│       │                                                          │
│       ├───► adminQuery ──► Requires role = admin                │
│       │                  + permissions check                    │
│       │                                                          │
│       └───► studentQuery ──► Requires role = student            │
│                            + permissions check                  │
│                                                                  │
│  permQuery(resource, action) ──► Requires specific permission   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Middleware Implementation

```typescript
// api/middleware.ts

// Level 1: Public — no auth
export const publicQuery = t.procedure;

// Level 2: Authenticated — any user (OAuth or local)
const requireAuth = t.middleware(async (opts) => {
  const { ctx } = opts;
  if (!ctx.user && !ctx.localUser) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});
export const authedQuery = t.procedure.use(requireAuth);

// Level 3a: Admin — requires admin role
const requireAdmin = t.middleware(async (opts) => {
  const { ctx } = opts;
  const actor = ctx.user ?? ctx.localUser;
  if (!actor || actor.role?.name !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  // Check permissions
  if (!hasPermission(ctx.rolePermissions, "admin", "dashboard")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Missing dashboard permission" });
  }
  return next({ ctx });
});
export const adminQuery = authedQuery.use(requireAdmin);

// Level 3b: Student — requires student role
const requireStudent = t.middleware(async (opts) => {
  const { ctx } = opts;
  if (!ctx.localUser) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Student access required" });
  }
  if (ctx.localUser.status !== "active") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Account is not active" });
  }
  return next({ ctx });
});
export const studentQuery = authedQuery.use(requireStudent);

// Level 4: Permission-based — requires specific permission
export function requirePermission(resource: string, action: string) {
  return t.middleware(async (opts) => {
    const { ctx } = opts;
    const perms = ctx.role?.permissions ?? [];
    const has = perms.some(p => p.resource === resource && p.action === action);
    if (!has) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Missing permission: ${resource}:${action}`,
      });
    }
    return next({ ctx });
  });
}
```

### 5.3 Role Resolution with Permissions

```typescript
// api/queries/roles.ts
export async function getRoleWithPermissions(roleId: number) {
  const db = getDb();
  const role = await db.query.roles.findFirst({
    where: eq(roles.id, roleId),
    with: {
      permissions: {
        with: {
          permission: true,
        },
      },
    },
  });

  if (!role) return null;

  return {
    ...role,
    permissions: role.permissions.map((rp) => rp.permission),
  };
}
```

---

## 6. API Endpoint Design

### 6.1 Authentication Router (`auth`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `auth.me` | query | authed | Get current user info |
| `auth.logout` | mutation | authed | Clear session cookie |

### 6.2 Unified Auth Router (`unifiedAuth`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `unifiedAuth.login` | mutation | public | Unified login (admin OAuth redirect OR student credentials) |
| `unifiedAuth.me` | query | authed | Get current authenticated actor (user or student) |
| `unifiedAuth.logout` | mutation | authed | Clear all session cookies |

### 6.3 Student Router (`student`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `student.me` | query | student | Get current student profile |
| `student.getProgress` | query | student | Get student learning progress |
| `student.updateProgress` | mutation | student | Update own progress |
| `student.list` | query | admin | List all students |
| `student.create` | mutation | admin | Create new student account |
| `student.update` | mutation | admin | Update student (name, status) |
| `student.delete` | mutation | admin | Delete/suspend student |
| `student.getEnrollments` | query | admin | Get student's course enrollments |
| `student.enroll` | mutation | admin | Enroll student in topic |
| `student.unenroll` | mutation | admin | Remove enrollment |

### 6.4 Admin Router (`admin`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `admin.dashboardStats` | query | admin | Get dashboard statistics |
| `admin.listUsers` | query | admin | List all users |
| `admin.listStudents` | query | admin | List all students with pagination |
| `admin.createStudent` | mutation | admin | Create student with bcrypt password |
| `admin.updateStudent` | mutation | admin | Update student name/status |
| `admin.deleteStudent` | mutation | admin | Delete student |
| `admin.suspendStudent` | mutation | admin | Suspend student account |
| `admin.activateStudent` | mutation | admin | Reactivate student |

### 6.5 CMS Router (`cms`)

| Endpoint | Type | Auth | Permission | Description |
|----------|------|------|------------|-------------|
| `cms.listTopics` | query | admin | topics:read | List all topics |
| `cms.createTopic` | mutation | admin | topics:create | Create topic |
| `cms.updateTopic` | mutation | admin | topics:update | Update topic |
| `cms.deleteTopic` | mutation | admin | topics:delete | Delete topic |
| `cms.listSubtopics` | query | admin | topics:read | List subtopics by topic |
| `cms.createSubtopic` | mutation | admin | topics:create | Create subtopic |
| `cms.updateSubtopic` | mutation | admin | topics:update | Update subtopic |
| `cms.deleteSubtopic` | mutation | admin | topics:delete | Delete subtopic |
| `cms.listLabs` | query | admin | labs:access | List all labs |
| `cms.createLab` | mutation | admin | labs:access | Create lab |
| `cms.updateLab` | mutation | admin | labs:access | Update lab |
| `cms.deleteLab` | mutation | admin | labs:access | Delete lab |

### 6.6 Audit Router (`audit`)

| Endpoint | Type | Auth | Description |
|----------|------|------|-------------|
| `audit.list` | query | admin | List audit log entries (paginated) |
| `audit.listByActor` | query | admin | Filter by actor |
| `audit.listByResource` | query | admin | Filter by resource |

---

## 7. Security Headers & CSRF Protection

### 7.1 Security Headers Middleware

```typescript
// Applied to all responses
app.use(secureHeaders({
  xFrameOptions: "DENY",
  xContentTypeOptions: "nosniff",
  xXssProtection: "1; mode=block",
  referrerPolicy: "strict-origin-when-cross-origin",
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  },
}));
```

### 7.2 Input Sanitization

All inputs validated with Zod schemas before processing:
```typescript
// Example: student creation input
const createStudentInput = z.object({
  login: z.string().min(3).max(100).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255),
});
```

All database operations use Drizzle ORM parameterized queries (no raw SQL).

---

## 8. Error Handling

| Error Code | HTTP Status | When |
|------------|-------------|------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Authenticated but no permission |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `BAD_REQUEST` | 400 | Invalid input |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

All errors use the `@contracts/errors` factory for consistent error responses.
