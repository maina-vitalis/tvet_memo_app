import { useQuery } from "@tanstack/react-query";

import { selectCurrentUser } from "@/src/features/auth/store/authSelectors";
import { getDepartments } from "@/src/features/memos/api/departmentsApi";
import { getTargetableUsers } from "@/src/features/memos/api/targetableUsersApi";
import { useProfileQuery } from "@/src/features/profile/hooks/useProfile";
import { useDebounce } from "@/src/shared/hooks/useDebounce";
import { getTargetableRoles } from "@/src/shared/rbac/role-rank";
import { useAppSelector } from "@/src/shared/store/hooks";

export const memoTargetingKeys = {
  departments: ["memo-targeting", "departments"] as const,
  users: (search: string) => ["memo-targeting", "users", search] as const,
};

export function useActorRole() {
  const user = useAppSelector(selectCurrentUser);
  const { data: profile } = useProfileQuery();

  return user?.role ?? profile?.role ?? null;
}

export function useTargetableRoles() {
  const actorRole = useActorRole();

  return getTargetableRoles(actorRole);
}

export function useDepartmentsQuery(enabled = true) {
  return useQuery({
    queryKey: memoTargetingKeys.departments,
    queryFn: getDepartments,
    enabled,
  });
}

export function useTargetableUsersQuery(search: string, enabled = true) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery({
    queryKey: memoTargetingKeys.users(debouncedSearch),
    queryFn: () => getTargetableUsers(debouncedSearch),
    enabled,
  });
}
