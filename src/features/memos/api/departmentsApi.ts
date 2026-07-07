import apiClient from "@/src/shared/utils/apiClient";

export type Department = {
  id: string;
  institutionId: string;
  name: string;
  code: string | null;
  headUserId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getDepartments(): Promise<Department[]> {
  const { data } = await apiClient.get<Department[]>("/departments");
  return data;
}
