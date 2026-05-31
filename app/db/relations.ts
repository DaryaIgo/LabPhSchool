import { relations } from "drizzle-orm";
import {
  roles,
  permissions,
  rolePermissions,
  users,
  localUsers,
  enrollments,
  topics,
  subtopics,
  labs,
} from "./schema";

// ── Roles ──
export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
}));

// ── Permissions ──
export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

// ── Role Permissions ──
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

// ── Users (OAuth) ──
export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

// ── Local Users (students) ──
export const localUsersRelations = relations(localUsers, ({ one, many }) => ({
  role: one(roles, {
    fields: [localUsers.roleId],
    references: [roles.id],
  }),
  creator: one(users, {
    fields: [localUsers.createdBy],
    references: [users.id],
  }),
  enrollments: many(enrollments),
}));

// ── Enrollments ──
export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  localUser: one(localUsers, {
    fields: [enrollments.localUserId],
    references: [localUsers.id],
  }),
  topic: one(topics, {
    fields: [enrollments.topicId],
    references: [topics.id],
  }),
  creator: one(users, {
    fields: [enrollments.createdBy],
    references: [users.id],
  }),
}));

// ── Topics ──
export const topicsRelations = relations(topics, ({ many }) => ({
  subtopics: many(subtopics),
  labs: many(labs),
  enrollments: many(enrollments),
}));

// ── Subtopics ──
export const subtopicsRelations = relations(subtopics, ({ one }) => ({
  topic: one(topics, {
    fields: [subtopics.topicId],
    references: [topics.id],
  }),
}));

// ── Labs ──
export const labsRelations = relations(labs, ({ one }) => ({
  topic: one(topics, {
    fields: [labs.topicId],
    references: [topics.id],
  }),
}));
