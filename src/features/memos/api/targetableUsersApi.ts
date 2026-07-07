import type { Role } from "@/src/shared/types";
import apiClient from "@/src/shared/utils/apiClient";

export type TargetableUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  departmentId: string | null;
};

export async function getTargetableUsers(
  search?: string,
): Promise<TargetableUser[]> {
  const { data } = await apiClient.get<TargetableUser[]>(
    "/memos/targetable-users",
    {
      params: search?.trim() ? { q: search.trim() } : undefined,
    },
  );

  return data;
}
