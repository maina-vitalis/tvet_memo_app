import type { User } from "@/src/shared/types";
import apiClient from "@/src/shared/utils/apiClient";
import { getStore } from "@/src/shared/store/storeRef";

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const userId = getStore().getState().auth.user?.id;

  if (!userId) {
    throw new Error("You must be signed in to update your profile.");
  }

  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    avatarUrl: data.avatarUrl,
    preferredLang: data.preferredLang,
  };

  const { data: updated } = await apiClient.patch<User>(
    `/users/${userId}`,
    payload,
  );

  return updated;
}