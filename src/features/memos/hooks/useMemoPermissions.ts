import { selectCurrentUser } from "@/src/features/auth/store/authSelectors";
import { useProfileQuery } from "@/src/features/profile/hooks/useProfile";
import { canBroadcastMemo } from "@/src/shared/rbac/permissions";
import { useAppSelector } from "@/src/shared/store/hooks";

export function useCanCreateMemo(): boolean {
  const user = useAppSelector(selectCurrentUser);
  const { data: profile } = useProfileQuery();

  const role = user?.role ?? profile?.role;

  return canBroadcastMemo(role);
}
