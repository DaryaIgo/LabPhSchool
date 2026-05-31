# LabPhSchool — Security Flow Diagram

## Document: SEC-FLOW-001
## Date: 2026-05-31
## Status: PROPOSED → IMPLEMENTED

---

## 1. User Login Flow (Unified Authentication Gateway)

### 1.1 Student Login (Username/Password)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Browser    │     │   Hono API   │     │   MySQL (Drizzle) │
└──────┬───────┘     └──────┬───────┘     └────────┬─────────┘
       │                    │                      │
       │  POST /api/trpc/unifiedAuth.login         │
       │  { login, password, type: "student" }     │
       │ ────────────────────────────────────────> │
       │                    │                      │
       │                    │  SELECT * FROM local_users
       │                    │  WHERE login = ?    │
       │                    │ ──────────────────> │
       │                    │                      │
       │                    │  <───────────────── │
       │                    │  { id, password_hash, ... }
       │                    │                      │
       │                    │  bcrypt.compare(password, hash)
       │                    │  ──────► MATCH
       │                    │                      │
       │                    │  SELECT * FROM roles
       │                    │  WHERE id = ?       │
       │                    │ ──────────────────> │
       │                    │  <───────────────── │
       │                    │  { name: "student" } │
       │                    │                      │
       │                    │  SELECT p.* FROM permissions p
       │                    │  JOIN role_permissions rp ON ...
       │                    │  WHERE rp.role_id = ?          │
       │                    │ ─────────────────────────────> │
       │                    │  <──────────────────────────── │
       │                    │  [ { resource, action }, ... ] │
       │                    │                      │
       │                    │  Sign JWT:           │
       │                    │  { studentId, login,│
       │                    │    role, perms, iat, exp }     │
       │                    │                      │
       │                    │  UPDATE local_users │
       │                    │  SET last_login_at = NOW()     │
       │                    │  WHERE id = ?       │
       │                    │ ──────────────────> │
       │                    │                      │
       │                    │  INSERT INTO audit_log         │
       │                    │  (actor_id, actor_type, action, │
       │                    │   resource, details, success)  │
       │                    │ ──────────────────> │
       │                    │                      │
       │  Set-Cookie: student_session=<JWT>        │
       │  HttpOnly; SameSite=Lax; Secure; Path=/   │
       │  <─────────────────────────────────────── │
       │                    │                      │
       │  { success: true, student: { id, name } } │
       │  <─────────────────────────────────────── │
       │                    │                      │
```

**Security checks during login:**
1. ✅ Input validated with Zod (login: 3-100 chars alphanumeric, password: 8-128 chars)
2. ✅ Rate limiting: max 5 attempts per 15 minutes per IP
3. ✅ bcrypt comparison (timing-safe)
4. ✅ Account status check (active/inactive/suspended)
5. ✅ JWT signed with HS256 using APP_SECRET
6. ✅ HttpOnly, SameSite=Lax, Secure cookie
7. ✅ Audit log entry created
8. ✅ Last login timestamp updated

---

### 1.2 Admin/Teacher Login (OAuth 2.0)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Browser    │     │   Hono API   │     │  Kimi Platform   │     │   MySQL     │
└──────┬───────┘     └──────┬───────┘     └────────┬─────────┘     └──────┬──────┘
       │                    │                      │                      │
       │  Click "Login as Teacher"                │                      │
       │ ────────────────────────────────────────>│                      │
       │                    │                      │                      │
       │  302 Redirect to Kimi OAuth              │                      │
       │  /api/oauth/authorize?client_id=...      │                      │
       │  <───────────────────────────────────────│                      │
       │                    │                      │                      │
       │  User authenticates on Kimi              │                      │
       │  ──────────────────────────────────────────────────────────────>│
       │                    │                      │                      │
       │  302 Redirect back with ?code=...        │                      │
       │  <──────────────────────────────────────────────────────────────│
       │                    │                      │                      │
       │  GET /api/oauth/callback?code=...        │                      │
       │ ────────────────────────────────────────>│                      │
       │                    │                      │                      │
       │                    │  POST /api/oauth/token                      │
       │                    │  { grant_type, code, client_id,             │
       │                    │    client_secret, redirect_uri }            │
       │                    │ ────────────────────────────────────────>  │
       │                    │                      │                      │
       │                    │  { access_token, refresh_token, ... }      │
       │                    │  <────────────────────────────────────────  │
       │                    │                      │                      │
       │                    │  GET /api/users/me                      │
       │                    │  Authorization: Bearer <access_token>   │
       │                    │ ────────────────────────────────────────>│
       │                    │                      │                      │
       │                    │  { unionId, name, avatar_url }           │
       │                    │  <────────────────────────────────────────│
       │                    │                      │                      │
       │                    │  SELECT * FROM users                    │
       │                    │  WHERE unionId = ?  │                      │
       │                    │ ────────────────────────────────────────>│
       │                    │                      │                      │
       │                    │  UPSERT user (name, avatar, lastSignInAt) │
       │                    │ ────────────────────────────────────────>│
       │                    │                      │                      │
       │                    │                      │                      │
       │                    │  Sign JWT session:  │                      │
       │                    │  { unionId, clientId, iat, exp }        │
       │                    │                      │                      │
       │  Set-Cookie: auth_session=<JWT>           │                      │
       │  HttpOnly; SameSite=Lax; Secure; Path=/   │                      │
       │  <───────────────────────────────────────│                      │
       │                    │                      │                      │
       │  302 Redirect to /                         │                      │
       │  <───────────────────────────────────────│                      │
```

**Security checks during OAuth:**
1. ✅ PKCE not needed (server-side flow)
2. ✅ State parameter verified (base64-encoded redirect URI)
3. ✅ Authorization code exchanged server-side (never exposed to client)
4. ✅ Access token verified via JWKS (RS256)
5. ✅ User profile fetched with access token
6. ✅ JWT session signed with HS256 (APP_SECRET)
7. ✅ HttpOnly, SameSite=Lax, Secure cookie
8. ✅ Automatic admin assignment for OWNER_UNION_ID

---

## 2. RBAC Authorization Flow (API Request)

### 2.1 Authenticated Request Processing

```
┌──────────────┐     ┌─────────────────────────────────────────────────────────┐
│   Browser    │     │                    Hono Server                           │
│  (React SPA) │     │                                                          │
└──────┬───────┘     │  1. HTTPS Request Received                               │
       │             │     │                                                    │
       │             │     ▼                                                    │
       │             │  2. Security Headers Applied                             │
       │             │     (CSP, X-Frame-Options, HSTS, etc.)                  │
       │             │     │                                                    │
       │             │     ▼                                                    │
       │             │  3. CORS Check (same-origin only)                        │
       │             │     │                                                    │
       │             │     ▼                                                    │
       │             │  4. tRPC Context Builder                                 │
       │             │     │                                                    │
       │             │     ├─── Read Cookie: auth_session                      │
       │             │     │    └─── Verify JWT → OAuth user                    │
       │             │     │         │                                          │
       │             │     │         ├─── Valid ──► ctx.user = user            │
       │             │     │         │              ctx.role = role+perms      │
       │             │     │         │                                          │
       │             │     │         └─── Invalid ──► Continue...               │
       │             │     │                                                    │
       │             │     ├─── Read Cookie: student_session                   │
       │             │     │    └─── Verify JWT → local user                    │
       │             │     │         │                                          │
       │             │     │         ├─── Valid ──► ctx.localUser = student    │
       │             │     │         │              ctx.role = role+perms      │
       │             │     │         │                                          │
       │             │     │         └─── Invalid ──► ctx = unauthenticated    │
       │             │     │                                                    │
       │             │     ▼                                                    │
       │             │  5. Procedure Middleware Chain                           │
       │             │     │                                                    │
       │             │     ├─── publicQuery ───────────────────────────────┐   │
       │             │     │    │ No auth check, proceed                  │   │
       │             │     │    ▼                                          │   │
       │             │     ├─── authedQuery ─────────────────────────────┐ │   │
       │             │     │    │ Check ctx.user || ctx.localUser         │ │   │
       │             │     │    │ UNAUTHORIZED if neither                │ │   │
       │             │     │    ▼                                        │ │   │
       │             │     ├─── adminQuery ────────────────────────────┐ │ │   │
       │             │     │    │ Check role.name === "admin"           │ │ │   │
       │             │     │    │ FORBIDDEN if not admin                │ │ │   │
       │             │     │    │ Check permissions                     │ │ │   │
       │             │     │    ▼                                      │ │ │   │
       │             │     ├─── studentQuery ──────────────────────────┘ │ │   │
       │             │     │    │ Check role.name === "student"         │ │   │
       │             │     │    │ FORBIDDEN if not student              │ │   │
       │             │     │    │ Check account status === "active"     │ │   │
       │             │     │    ▼                                      │ │   │
       │             │     ├─── requirePermission(resource, action) ───┘ │   │
       │             │     │    │ Check role.permissions[]                │   │
       │             │     │    │ FORBIDDEN if missing permission         │   │
       │             │     │    ▼                                        │   │
       │             │     ▼                                              │   │
       │             │  6. Handler Execution                              │   │
       │             │     │                                              │   │
       │             │     ├─── Zod Input Validation                      │   │
       │             │     │    │ Invalid ──► BAD_REQUEST                 │   │
       │             │     │    ▼                                        │   │
       │             │     ├─── Drizzle ORM Query                        │   │
       │             │     │    │ Parameterized queries only             │   │
       │             │     │    ▼                                        │   │
       │             │     ├─── Audit Log Entry                          │   │
       │             │     │    │ action, resource, actor, success       │   │
       │             │     │    ▼                                        │   │
       │             │     └─── Response                                  │   │
       │             │                                                   │   │
       │             └────────────────────────────────────────────────────┘   │
       │                                                                    │
       │  JSON Response (superjson)                                         │
       │ <──────────────────────────────────────────────────────────────────│
```

---

## 3. Admin GUI → Database Interaction Flow

### 3.1 Admin Creates New Student

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────────────────────┐
│  Admin GUI   │     │  tRPC API    │     │  Database (Drizzle ORM)         │
│  (React)     │     │  (Protected) │     │  (MySQL 8)                      │
└──────┬───────┘     └──────┬───────┘     └────────┬────────────────────────┘
       │                    │                      │
       │  1. Form Submit     │                      │
       │  { name, login,    │                      │
       │    password }       │                      │
       │ ────────────────────────────────────────>  │
       │                    │                      │
       │                    │  2. adminQuery        │
       │                    │     middleware        │
       │                    │  ──────────────────  │
       │                    │  Check:              │
       │                    │  - Cookie auth_session│
       │                    │  - role.name == admin │
       │                    │  - perms includes     │
       │                    │    "users:create"     │
       │                    │                      │
       │                    │  ❌ FORBIDDEN ─────> │
       │                    │     if non-admin      │
       │                    │                      │
       │                    │  ✅ Proceed           │
       │                    │                      │
       │                    │  3. Zod Validation    │
       │                    │  - login: 3-100 chars │
       │                    │    alphanumeric       │
       │                    │  - password: 8-128    │
       │                    │  - name: 1-255 chars  │
       │                    │                      │
       │                    │  ❌ BAD_REQUEST ───> │
       │                    │     if invalid        │
       │                    │                      │
       │                    │  ✅ Proceed           │
       │                    │                      │
       │                    │  4. Check login       │
       │                    │     uniqueness        │
       │                    │                      │
       │                    │  SELECT * FROM        │
       │                    │  local_users          │
       │                    │  WHERE login = ?      │
       │                    │ ──────────────────>  │
       │                    │  <────────────────── │
       │                    │                      │
       │                    │  ❌ CONFLICT ──────> │
       │                    │     if exists         │
       │                    │                      │
       │                    │  ✅ Proceed           │
       │                    │                      │
       │                    │  5. Hash Password     │
       │                    │  bcrypt.hash(password,│
       │                    │           12)         │
       │                    │  ──────► $2a$12$...  │
       │                    │                      │
       │                    │  6. Insert Student    │
       │                    │                      │
       │                    │  INSERT INTO          │
       │                    │  local_users          │
       │                    │  (login, password_    │
       │                    │   hash, name, role_   │
       │                    │   id, created_by)     │
       │                    │  VALUES (?, ?, ?, 2,  │
       │                    │         ctx.user.id)  │
       │                    │ ──────────────────>  │
       │                    │  <────────────────── │
       │                    │                      │
       │                    │  7. Audit Log         │
       │                    │                      │
       │                    │  INSERT INTO          │
       │                    │  audit_log            │
       │                    │  (actor_id, actor_    │
       │                    │   type, action,       │
       │                    │   resource, details,  │
       │                    │   success)            │
       │                    │  VALUES (?, 'user',   │
       │                    │   'create',           │
       │                    │   'users',            │
       │                    │   '{studentLogin}',   │
       │                    │   true)               │
       │                    │ ──────────────────>  │
       │                    │                      │
       │                    │  8. Response          │
       │  { success: true,   │                      │
       │    student: {       │                      │
       │      id, login,     │                      │
       │      name           │                      │
       │    }                │                      │
       │  }                  │                      │
       │ <────────────────────────────────────────  │
       │                    │                      │
```

**Security layers applied:**
1. ✅ HTTPS transport encryption
2. ✅ HttpOnly session cookie authentication
3. ✅ RBAC role check (admin only)
4. ✅ Permission check (users:create)
5. ✅ Zod input validation (injection prevention)
6. ✅ Login uniqueness check
7. ✅ bcrypt password hashing (cost 12)
8. ✅ Parameterized Drizzle ORM queries (SQL injection prevention)
9. ✅ Audit log entry
10. ✅ No password returned in response

---

### 3.2 Admin Updates Course Content (CMS)

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────────────────────┐
│  Admin CMS   │     │  tRPC API    │     │  Database (Drizzle ORM)         │
│  (React)     │     │  (Protected) │     │  (MySQL 8)                      │
└──────┬───────┘     └──────┬───────┘     └────────┬────────────────────────┘
       │                    │                      │
       │  1. Submit Update   │                      │
       │  { id, title,       │                      │
       │    description }    │                      │
       │ ────────────────────────────────────────>  │
       │                    │                      │
       │                    │  2. adminQuery        │
       │                    │     + requirePermission│
       │                    │     ("topics", "update")│
       │                    │  ──────────────────  │
       │                    │                      │
       │                    │  ❌ FORBIDDEN ─────> │
       │                    │  (403 response)       │
       │                    │                      │
       │                    │  ✅ Proceed           │
       │                    │                      │
       │                    │  3. Zod Validation    │
       │                    │  - id: positive int   │
       │                    │  - title: 1-255 chars │
       │                    │  - description:       │
       │                    │    optional string    │
       │                    │                      │
       │                    │  ❌ BAD_REQUEST ───> │
       │                    │  (400 response)       │
       │                    │                      │
       │                    │  ✅ Proceed           │
       │                    │                      │
       │                    │  4. Parameterized     │
       │                    │     UPDATE (Drizzle)  │
       │                    │                      │
       │                    │  UPDATE topics        │
       │                    │  SET title = ?,       │
       │                    │      description = ?  │
       │                    │  WHERE id = ?         │
       │                    │  [params bound]       │
       │                    │ ──────────────────>  │
       │                    │                      │
       │                    │  5. Audit Log         │
       │                    │                      │
       │                    │  INSERT INTO audit_log│
       │                    │  (actor_id, action,   │
       │                    │   resource,           │
       │                    │   resource_id,        │
       │                    │   details)            │
       │                    │  VALUES (?, 'update', │
       │                    │   'topics', id,       │
       │                    │   '{old,new}')        │
       │                    │ ──────────────────>  │
       │                    │                      │
       │  { success: true }  │                      │
       │ <────────────────────────────────────────  │
```

**Key security measures:**
1. ✅ Admin authentication via HttpOnly cookie
2. ✅ RBAC permission check (`topics:update`)
3. ✅ Zod schema validation prevents injection
4. ✅ Drizzle ORM parameterized queries prevent SQL injection
5. ✅ Audit log tracks all content changes
6. ✅ Old/new values logged for change tracking

---

## 4. Student Access Flow (Enrollment Check)

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────────────────────┐
│   Browser    │     │  tRPC API    │     │  Database (Drizzle ORM)         │
│  (Student)   │     │  (Protected) │     │  (MySQL 8)                      │
└──────┬───────┘     └──────┬───────┘     └────────┬────────────────────────┘
       │                    │                      │
       │  GET /api/trpc/    │                      │
       │  student.getProgress│                      │
       │ ────────────────────────────────────────>  │
       │  Cookie: student_session=<JWT>             │
       │                    │                      │
       │                    │  1. Verify JWT        │
       │                    │  from cookie          │
       │                    │  ──────► Valid       │
       │                    │                      │
       │                    │  2. studentQuery      │
       │                    │     middleware        │
       │                    │  - Check ctx.localUser│
       │                    │  - Check status=active│
       │                    │                      │
       │                    │  ❌ FORBIDDEN ─────> │
       │                    │  (account suspended)  │
       │                    │                      │
       │                    │  ✅ Proceed           │
       │                    │                      │
       │                    │  3. Load Progress     │
       │                    │                      │
       │                    │  SELECT sp.*, s.title │
       │                    │  FROM student_progress sp│
       │                    │  JOIN subtopics s ON  │
       │                    │    sp.subtopic_id =   │
       │                    │    s.id               │
       │                    │  WHERE sp.local_user_ │
       │                    │        id = ?         │
       │                    │ ──────────────────>  │
       │                    │                      │
       │                    │  4. Check Enrollments │
       │                    │  (for topic access)   │
       │                    │                      │
       │                    │  SELECT e.*, t.title  │
       │                    │  FROM enrollments e   │
       │                    │  JOIN topics t ON     │
       │                    │    e.topic_id = t.id  │
       │                    │  WHERE e.local_user_  │
       │                    │        id = ?         │
       │                    │  AND e.status =       │
       │                    │       'active'        │
       │                    │ ──────────────────>  │
       │                    │                      │
       │                    │  5. Filter Results    │
       │                    │  - Only return        │
       │                    │    progress for       │
       │                    │    enrolled topics    │
       │                    │                      │
       │  { progress: [...], │                      │
       │    enrollments: [...]│                     │
       │  }                  │                      │
       │ <────────────────────────────────────────  │
```

**Dynamic access validation:**
1. ✅ Student authenticated via HttpOnly cookie
2. ✅ Account status verified (active)
3. ✅ Progress loaded from database
4. ✅ Enrollment check filters access to topics
5. ✅ Only enrolled topic progress returned
6. ✅ All queries parameterized via Drizzle ORM
