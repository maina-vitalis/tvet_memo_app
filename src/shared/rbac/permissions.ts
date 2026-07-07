import type { Role } from "@/src/shared/types";

export const Permission = {
  MANAGE_INSTITUTIONS: "manage_institutions",
  MANAGE_TENANT_USERS: "manage_tenant_users",
  PROVISION_USERS_BULK: "provision_users_bulk",
  MANAGE_ROLES: "manage_roles",
  BROADCAST_MEMO: "broadcast_memo",
  APPROVE_MEMO: "approve_memo",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  VIEW_BOARD_REPORTS: "view_board_reports",
  ACKNOWLEDGE_MEMO: "acknowledge_memo",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: Object.values(Permission),
  CHAIRPERSON: [
    Permission.VIEW_BOARD_REPORTS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.ACKNOWLEDGE_MEMO,
  ],
  BOARD_MEMBER: [Permission.VIEW_BOARD_REPORTS, Permission.ACKNOWLEDGE_MEMO],
  PRINCIPAL: [
    Permission.MANAGE_TENANT_USERS,
    Permission.MANAGE_ROLES,
    Permission.BROADCAST_MEMO,
    Permission.APPROVE_MEMO,
    Permission.VIEW_AUDIT_LOGS,
    Permission.ACKNOWLEDGE_MEMO,
  ],
  DEPUTY_PRINCIPAL_ACADEMICS: [
    Permission.BROADCAST_MEMO,
    Permission.APPROVE_MEMO,
    Permission.ACKNOWLEDGE_MEMO,
  ],
  DEPUTY_PRINCIPAL_ADMIN: [
    Permission.MANAGE_TENANT_USERS,
    Permission.BROADCAST_MEMO,
    Permission.ACKNOWLEDGE_MEMO,
  ],
  INSTITUTION_ADMIN: [
    Permission.MANAGE_TENANT_USERS,
    Permission.PROVISION_USERS_BULK,
    Permission.MANAGE_ROLES,
    Permission.VIEW_AUDIT_LOGS,
  ],
  HOD: [Permission.BROADCAST_MEMO, Permission.ACKNOWLEDGE_MEMO],
  TRAINER: [Permission.ACKNOWLEDGE_MEMO],
  TRAINEE: [Permission.ACKNOWLEDGE_MEMO],
};

export function hasPermission(
  role: Role | null | undefined,
  permission: Permission,
): boolean {
  if (!role) {
    return false;
  }

  return (ROLE_PERMISSIONS[role] ?? []).includes(permission);
}

export function canBroadcastMemo(role: Role | null | undefined): boolean {
  return hasPermission(role, Permission.BROADCAST_MEMO);
}
