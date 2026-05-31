# LabPhSchool — Database Schema Design

## Document: DB-SCHEMA-001
## Date: 2026-05-31
## Status: PROPOSED → IMPLEMENTED

---

## 1. Overview

This document describes the enhanced database schema for the LabPhSchool Authentication & Authorization system. The schema is designed around **Role-Based Access Control (RBAC)** with two primary roles: `student` and `admin` (teacher).

**Key design decisions:**
- Unified `users` table with `role` enum for RBAC
- Separate `localUsers` table for password-based authentication (students created by admin)
- `permissions` table for fine-grained access control
- `rolePermissions` junction table linking roles to permissions
- `enrollments` table for course access management
- `auditLog` table for security tracking
- Passwords hashed with **bcrypt** (cost factor 12)
- All timestamps use `timestamp` with `defaultNow()`

---

## 2. Entity Relationship Diagram

```
+------------------+       +------------------+       +------------------+
|     roles        |       |   permissions    |       | role_permissions |
+------------------+       +------------------+       +------------------+
| id (PK)          |<----->| id (PK)          |<----->| id (PK)          |
| name (UK)        |       | name (UK)        |       | roleId (FK)      |
| description      |       | resource         |       | permissionId(FK) |
| createdAt        |       | action           |       +------------------+
+------------------+       | description      |
                           | createdAt        |
                           +------------------+
                                    ^
                                    |
+------------------+       +------------------+
|     users        |       |   local_users    |
+------------------+       +------------------+
| id (PK)          |       | id (PK)          |
| unionId (UK)     |       | login (UK)       |
| name             |       | passwordHash     |
| email            |       | name             |
| avatar           |       | roleId (FK)      |
| roleId (FK) ---->|------>| createdBy (FK)   |
| createdAt        |       | status           |
| updatedAt        |       | createdAt        |
| lastSignInAt     |       | updatedAt        |
+------------------+       +------------------+
         |                          |
         |                          |
         v                          v
+------------------+       +------------------+
|   enrollments    |       | student_progress |
+------------------+       +------------------+
| id (PK)          |       | id (PK)          |
| userId (FK)      |       | localUserId (FK) |
| topicId (FK)     |       | subtopicId (FK)  |
| status           |       | theoryCompleted  |
| enrolledAt       |       | practiceCompleted|
| expiresAt        |       | labCompleted     |
+------------------+       | notes            |
                           | createdAt        |
                           | updatedAt        |
                           +------------------+
                                    ^
                                    |
+------------------+       +------------------+
|    audit_log     |       |     topics       |
+------------------+       +------------------+
| id (PK)          |       | id (PK)          |
| actorId          |       | order            |
| actorType        |       | title            |
| action           |       | slug (UK)        |
| resource         |       | ...              |
| resourceId       |       +------------------+
| details (JSON)   |
| ipAddress        |
| userAgent        |
| createdAt        |
+------------------+
```

---

## 3. Table Definitions

### 3.1 roles

```sql
CREATE TABLE roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial PK | auto-increment | Role identifier |
| name | varchar(50) | NOT NULL, UNIQUE | Role name: `admin`, `student` |
| description | varchar(255) | | Human-readable description |
| createdAt | timestamp | defaultNow() | Creation timestamp |

**Initial data:**
- `admin` — Teacher/Administrator with full system access
- `student` — Student with limited access to enrolled content

---

### 3.2 permissions

```sql
CREATE TABLE permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial PK | auto-increment | Permission identifier |
| name | varchar(100) | NOT NULL, UNIQUE | Permission codename |
| resource | varchar(50) | NOT NULL | Target resource (users, topics, problems, etc.) |
| action | varchar(50) | NOT NULL | CRUD action (create, read, update, delete, manage) |
| description | varchar(255) | | Human-readable description |
| createdAt | timestamp | defaultNow() | Creation timestamp |

**Initial data:**

| name | resource | action | description |
|------|----------|--------|-------------|
| users:manage | users | manage | Full CRUD on student accounts |
| users:create | users | create | Create new student accounts |
| users:read | users | read | View student accounts |
| users:update | users | update | Update student accounts |
| users:delete | users | delete | Delete/suspend student accounts |
| topics:manage | topics | manage | Full CRUD on course topics |
| topics:create | topics | create | Create new topics |
| topics:read | topics | read | View all topics |
| topics:update | topics | update | Update topics |
| topics:delete | topics | delete | Delete topics |
| problems:manage | problems | manage | Full CRUD on problems |
| problems:create | problems | create | Create problems |
| problems:read | problems | read | View problems |
| problems:update | problems | update | Update problems |
| problems:delete | problems | delete | Delete problems |
| enrollments:manage | enrollments | manage | Manage course enrollments |
| enrollments:create | enrollments | create | Enroll students |
| enrollments:read | enrollments | read | View enrollments |
| enrollments:update | enrollments | update | Update enrollments |
| content:access | content | access | Access course content |
| labs:access | labs | access | Access lab simulations |
| progress:read | progress | read | View own progress |
| progress:update | progress | update | Update own progress |
| admin:dashboard | admin | dashboard | Access admin dashboard |
| student:dashboard | student | dashboard | Access student dashboard |

---

### 3.3 role_permissions

Junction table implementing many-to-many relationship between roles and permissions.

```sql
CREATE TABLE role_permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id),
  UNIQUE KEY unique_role_permission (role_id, permission_id)
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial PK | auto-increment | Junction ID |
| roleId | bigint FK | → roles.id | Role reference |
| permissionId | bigint FK | → permissions.id | Permission reference |
| createdAt | timestamp | defaultNow() | Creation timestamp |

**Initial assignments:**

**Admin role gets ALL permissions.**

**Student role gets:**
- content:access
- labs:access
- progress:read
- progress:update
- student:dashboard

---

### 3.4 users (OAuth — Teachers/Admins)

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  union_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  email VARCHAR(320),
  avatar TEXT,
  role_id BIGINT UNSIGNED NOT NULL DEFAULT 2,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  last_sign_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial PK | auto-increment | User identifier |
| unionId | varchar(255) | NOT NULL, UNIQUE | Kimi Platform union ID |
| name | varchar(255) | | Display name |
| email | varchar(320) | | Email address |
| avatar | text | | Avatar URL |
| roleId | bigint FK | → roles.id, DEFAULT 2 | Role (2 = student by default for OAuth) |
| createdAt | timestamp | defaultNow() | Creation timestamp |
| updatedAt | timestamp | defaultNow(), onUpdate | Last update timestamp |
| lastSignInAt | timestamp | defaultNow() | Last sign-in timestamp |

---

### 3.5 local_users (Password-based — Students)

Students created by admin with username/password authentication.

```sql
CREATE TABLE local_users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  login VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL DEFAULT 2,
  created_by BIGINT UNSIGNED NOT NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial PK | auto-increment | User identifier |
| login | varchar(100) | NOT NULL, UNIQUE | Username for login |
| passwordHash | varchar(255) | NOT NULL | bcrypt hash (cost 12) |
| name | varchar(255) | NOT NULL | Display name |
| roleId | bigint FK | → roles.id, DEFAULT 2 | Role (2 = student) |
| createdBy | bigint FK | → users.id | Admin who created this account |
| status | enum | DEFAULT 'active' | Account status: active/inactive/suspended |
| createdAt | timestamp | defaultNow() | Creation timestamp |
| updatedAt | timestamp | defaultNow(), onUpdate | Last update timestamp |
| lastLoginAt | timestamp | NULL | Last successful login |

**Security notes:**
- Passwords hashed with **bcrypt** (cost factor 12), NOT SHA-256
- `status = 'suspended'` — account temporarily disabled by admin
- `status = 'inactive'` — account deactivated, can be reactivated
- `createdBy` ensures audit trail for who created each student

---

### 3.6 enrollments

Manages which students have access to which course topics.

```sql
CREATE TABLE enrollments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  local_user_id BIGINT UNSIGNED NOT NULL,
  topic_id BIGINT UNSIGNED NOT NULL,
  status ENUM('active', 'completed', 'suspended') DEFAULT 'active' NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  FOREIGN KEY (local_user_id) REFERENCES local_users(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE KEY unique_enrollment (local_user_id, topic_id)
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial PK | auto-increment | Enrollment ID |
| localUserId | bigint FK | → local_users.id, ON DELETE CASCADE | Student |
| topicId | bigint FK | → topics.id | Course topic |
| status | enum | DEFAULT 'active' | Enrollment status |
| enrolledAt | timestamp | defaultNow() | When enrolled |
| expiresAt | timestamp | NULL | Optional expiration date |
| createdBy | bigint FK | → users.id | Admin who created enrollment |

---

### 3.7 audit_log

Security audit trail for all significant actions.

```sql
CREATE TABLE audit_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT UNSIGNED NOT NULL,
  actor_type ENUM('user', 'local_user') NOT NULL,
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  resource_id BIGINT UNSIGNED,
  details JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  success BOOLEAN DEFAULT TRUE NOT NULL,
  error_message VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial PK | auto-increment | Log entry ID |
| actorId | bigint | NOT NULL | ID of the actor (user or local_user) |
| actorType | enum | NOT NULL | Type: 'user' or 'local_user' |
| action | varchar(50) | NOT NULL | Action performed (login, create, update, delete, etc.) |
| resource | varchar(50) | NOT NULL | Target resource type |
| resourceId | bigint | NULL | Target resource ID |
| details | json | NULL | Additional details |
| ipAddress | varchar(45) | NULL | Client IP address (IPv6 compatible) |
| userAgent | varchar(500) | NULL | Client user agent string |
| success | boolean | DEFAULT TRUE | Whether the action succeeded |
| errorMessage | varchar(500) | NULL | Error message if failed |
| createdAt | timestamp | defaultNow() | When the action occurred |

---

## 4. Indexes

| Table | Columns | Type | Purpose |
|-------|---------|------|---------|
| roles | name | UNIQUE | Fast role lookup by name |
| permissions | name | UNIQUE | Fast permission lookup |
| permissions | resource, action | INDEX | Filter by resource/action |
| role_permissions | roleId, permissionId | UNIQUE | Prevent duplicate assignments |
| users | unionId | UNIQUE | Fast OAuth user lookup |
| users | roleId | INDEX | Filter by role |
| local_users | login | UNIQUE | Fast login lookup |
| local_users | roleId | INDEX | Filter by role |
| local_users | createdBy | INDEX | Find students by creator |
| local_users | status | INDEX | Filter by status |
| enrollments | localUserId, topicId | UNIQUE | Prevent duplicate enrollments |
| enrollments | localUserId | INDEX | Find student's enrollments |
| enrollments | topicId | INDEX | Find topic's students |
| audit_log | actorId, actorType | INDEX | Find actor's actions |
| audit_log | resource, resourceId | INDEX | Find actions on resource |
| audit_log | createdAt | INDEX | Time-range queries |

---

## 5. Drizzle ORM Schema (TypeScript)

```typescript
import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  json,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ── ROLES ──
export const roles = mysqlTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Role = typeof roles.$inferSelect;

// ── PERMISSIONS ──
export const permissions = mysqlTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  resource: varchar("resource", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  resourceActionIdx: index("resource_action_idx").on(table.resource, table.action),
}));

export type Permission = typeof permissions.$inferSelect;

// ── ROLE PERMISSIONS ──
export const rolePermissions = mysqlTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: bigint("role_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => roles.id),
  permissionId: bigint("permission_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => permissions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueRolePermission: uniqueIndex("unique_role_permission")
    .on(table.roleId, table.permissionId),
}));

// ── USERS (OAuth) ──
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("union_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  roleId: bigint("role_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => roles.id)
    .default(2), // student by default
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("last_sign_in_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;

// ── LOCAL USERS (password-based students) ──
export const localUsers = mysqlTable("local_users", {
  id: serial("id").primaryKey(),
  login: varchar("login", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  roleId: bigint("role_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => roles.id)
    .default(2), // student
  createdBy: bigint("created_by", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  status: mysqlEnum("status", ["active", "inactive", "suspended"])
    .default("active")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastLoginAt: timestamp("last_login_at"),
}, (table) => ({
  statusIdx: index("local_user_status_idx").on(table.status),
  createdByIdx: index("local_user_created_by_idx").on(table.createdBy),
}));

export type LocalUser = typeof localUsers.$inferSelect;

// ── ENROLLMENTS ──
export const enrollments = mysqlTable("enrollments", {
  id: serial("id").primaryKey(),
  localUserId: bigint("local_user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => localUsers.id, { onDelete: "cascade" }),
  topicId: bigint("topic_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => topics.id),
  status: mysqlEnum("status", ["active", "completed", "suspended"])
    .default("active")
    .notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
}, (table) => ({
  uniqueEnrollment: uniqueIndex("unique_enrollment")
    .on(table.localUserId, table.topicId),
  localUserIdx: index("enrollment_local_user_idx").on(table.localUserId),
  topicIdx: index("enrollment_topic_idx").on(table.topicId),
}));

export type Enrollment = typeof enrollments.$inferSelect;

// ── AUDIT LOG ──
export const auditLog = mysqlTable("audit_log", {
  id: serial("id").primaryKey(),
  actorId: bigint("actor_id", { mode: "number", unsigned: true }).notNull(),
  actorType: mysqlEnum("actor_type", ["user", "local_user"]).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  resource: varchar("resource", { length: 50 }).notNull(),
  resourceId: bigint("resource_id", { mode: "number", unsigned: true }),
  details: json("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  success: boolean("success").default(true).notNull(),
  errorMessage: varchar("error_message", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  actorIdx: index("audit_actor_idx").on(table.actorId, table.actorType),
  resourceIdx: index("audit_resource_idx").on(table.resource, table.resourceId),
  createdAtIdx: index("audit_created_at_idx").on(table.createdAt),
}));

export type AuditLogEntry = typeof auditLog.$inferSelect;
```

---

## 6. Relations (Drizzle)

```typescript
import { relations } from "drizzle-orm";

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
}));

export const localUsersRelations = relations(localUsers, ({ one, many }) => ({
  role: one(roles, { fields: [localUsers.roleId], references: [roles.id] }),
  creator: one(users, { fields: [localUsers.createdBy], references: [users.id] }),
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  localUser: one(localUsers, { fields: [enrollments.localUserId], references: [localUsers.id] }),
  topic: one(topics, { fields: [enrollments.topicId], references: [topics.id] }),
  creator: one(users, { fields: [enrollments.createdBy], references: [users.id] }),
}));
```

---

## 7. Migration Strategy

### Step 1: Create roles and permissions tables (no data dependencies)
### Step 2: Insert seed data (roles, permissions, role_permissions)
### Step 3: Migrate users table (add roleId FK, migrate existing role column)
### Step 4: Create local_users table (replaces students table)
### Step 5: Migrate existing students data to local_users
### Step 6: Create enrollments table
### Step 7: Create audit_log table
### Step 8: Drop old students table after data migration

All migrations use Drizzle Kit (`npm run db:generate` then `npm run db:migrate`).
