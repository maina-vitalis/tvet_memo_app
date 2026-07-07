import type { Role } from "@/src/shared/types";

/** Mirrors backend ROLE_RANK — higher number = higher authority. */
export const ROLE_RANK: Record<Role, number> = {
  SUPER_ADMIN: 100,
  CHAIRPERSON: 90,
  BOARD_MEMBER: 85,
  PRINCIPAL: 80,
  DEPUTY_PRINCIPAL_ACADEMICS: 70,
  DEPUTY_PRINCIPAL_ADMIN: 70,
  INSTITUTION_ADMIN: 65,
  HOD: 50,
  TRAINER: 30,
  TRAINEE: 10,
};

const INSTITUTION_TARGET_ROLES: Role[] = [
  "PRINCIPAL",
  "DEPUTY_PRINCIPAL_ACADEMICS",
  "DEPUTY_PRINCIPAL_ADMIN",
  "INSTITUTION_ADMIN",
  "HOD",
  "TRAINER",
  "TRAINEE",
];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  CHAIRPERSON: "Chairperson",
  BOARD_MEMBER: "Board Member",
  PRINCIPAL: "Principal",
  DEPUTY_PRINCIPAL_ACADEMICS: "Deputy Principal (Academics)",
  DEPUTY_PRINCIPAL_ADMIN: "Deputy Principal (Admin)",
  INSTITUTION_ADMIN: "Institution Admin",
  HOD: "Head of Department",
  TRAINER: "Trainer",
  TRAINEE: "Trainee",
};

export function getRoleRank(role: Role | null | undefined): number {
  if (!role) {
    return 0;
  }

  return ROLE_RANK[role] ?? 0;
}

/** Actors may target roles at or below their own rank. */
export function canTargetRole(
  actorRole: Role | null | undefined,
  targetRole: Role,
): boolean {
  if (!actorRole) {
    return false;
  }

  return getRoleRank(targetRole) <= getRoleRank(actorRole);
}

export function getTargetableRoles(actorRole: Role | null | undefined): Role[] {
  if (!actorRole) {
    return [];
  }

  return INSTITUTION_TARGET_ROLES.filter((role) =>
    canTargetRole(actorRole, role),
  ).sort((a, b) => ROLE_RANK[b] - ROLE_RANK[a]);
}

export function formatRoleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? role;
}
