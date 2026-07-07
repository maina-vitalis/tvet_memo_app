import type {
  MemoTargetType,
} from "@/src/features/memos/types/CreateMemoTypes";
import type { Role } from "@/src/shared/types";
import { getTargetableRoles } from "@/src/shared/rbac/role-rank";

export type MemoAudienceSelection = {
  targetType: MemoTargetType;
  selectedRoles: Role[];
  selectedDepartmentIds: string[];
  selectedUserIds: string[];
};

export function buildMemoTargetPayload(
  actorRole: Role,
  audience: MemoAudienceSelection,
): {
  targetType: MemoTargetType;
  targetPayload: Record<string, unknown>;
} {
  const targetableRoles = getTargetableRoles(actorRole);

  switch (audience.targetType) {
    case "broadcast":
      return {
        targetType: "role",
        targetPayload: { roles: targetableRoles },
      };

    case "role": {
      const roles = audience.selectedRoles.filter((role) =>
        targetableRoles.includes(role),
      );

      return {
        targetType: "role",
        targetPayload: { roles },
      };
    }

    case "department":
      return {
        targetType: "department",
        targetPayload: {
          department_ids: audience.selectedDepartmentIds,
        },
      };

    case "individual":
      return {
        targetType: "individual",
        targetPayload: {
          user_ids: audience.selectedUserIds,
        },
      };

    default:
      return {
        targetType: "role",
        targetPayload: { roles: targetableRoles },
      };
  }
}

export function isAudienceSelectionValid(
  actorRole: Role,
  audience: MemoAudienceSelection,
): boolean {
  switch (audience.targetType) {
    case "broadcast":
      return getTargetableRoles(actorRole).length > 0;

    case "role":
      return audience.selectedRoles.some((role) =>
        getTargetableRoles(actorRole).includes(role),
      );

    case "department":
      return audience.selectedDepartmentIds.length > 0;

    case "individual":
      return audience.selectedUserIds.length > 0;

    default:
      return false;
  }
}
