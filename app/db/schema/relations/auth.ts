import { relations } from "drizzle-orm";
import {
  roles,
  permissions,
  rolePermissions,
  users,
  localUsers,
} from "../auth";

export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  })
);

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

export const localUsersRelations = relations(localUsers, ({ one }) => ({
  role: one(roles, {
    fields: [localUsers.roleId],
    references: [roles.id],
  }),
  // createdBy is a soft reference inside the auth domain.
  creator: one(users, {
    fields: [localUsers.createdBy],
    references: [users.id],
  }),
}));
