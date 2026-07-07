import { selectCurrentUser } from "@/src/features/auth/store/authSelectors";
import { useProfileQuery } from "@/src/features/profile/hooks/useProfile";
import {
  hasPermission,
  Permission,
} from "@/src/shared/rbac/permissions";
import type { Role } from "@/src/shared/types";
import { useAppSelector } from "@/src/shared/store/hooks";

function resolveActorRole(
  authRole?: Role,
  profileRole?: Role,
): Role | null | undefined {
  return authRole ?? profileRole;
}

export function useCanBroadcastMemo(): boolean {
  const user = useAppSelector(selectCurrentUser);
  const { data: profile } = useProfileQuery();
  const role = resolveActorRole(user?.role, profile?.role);

  return hasPermission(role, Permission.BROADCAST_MEMO);
}

/** @alias useCanBroadcastMemo */
export function useCanCreateMemo(): boolean {
  return useCanBroadcastMemo();
}
