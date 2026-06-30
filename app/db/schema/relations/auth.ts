import { relations } from "drizzle-orm";
import {
  roles,
  permissions,
  rolePermissions,
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

export const localUsersRelations = relations(localUsers, ({ one }) => ({
  role: one(roles, {
    fields: [localUsers.roleId],
    references: [roles.id],
  }),
}));
