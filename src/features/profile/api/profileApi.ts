import { Platform } from "react-native";

import type { User } from "@/src/shared/types";
import apiClient from "@/src/shared/utils/apiClient";
import { getStore } from "@/src/shared/store/storeRef";
import tokenStorage from "@/src/features/auth/api/tokenStorage";
import { API_BASE_URL } from "@/src/shared/utils/config";

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export type ProfileImageInput = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export type UpdateMyProfileInput = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  image?: ProfileImageInput;
};

/**
 * [SELF-SERVICE] Edits the current user's own profile — text fields and/or a
 * new avatar are sent together as one multipart PATCH, so "Save" always
 * produces a single write instead of one request per field.
 *
 * Uses native fetch() instead of the shared axios instance: axios's automatic
 * multipart Content-Type/boundary handling is unreliable inside Metro's web
 * bundle, whereas fetch() sets it correctly on both web and React Native.
 */
export async function updateMyProfile(
  input: UpdateMyProfileInput,
): Promise<User> {
  const formData = new FormData();

  if (input.firstName !== undefined) formData.append("firstName", input.firstName);
  if (input.lastName !== undefined) formData.append("lastName", input.lastName);
  if (input.phoneNumber !== undefined) formData.append("phoneNumber", input.phoneNumber);

  if (input.image) {
    const fileName = input.image.fileName ?? "avatar.jpg";

    if (Platform.OS === "web") {
      // Browsers require a real Blob/File in FormData — the RN {uri,name,type}
      // shape below just gets stringified to "[object Object]" on web.
      const picked = await fetch(input.image.uri);
      const blob = await picked.blob();
      formData.append("file", blob, fileName);
    } else {
      formData.append("file", {
        uri: input.image.uri,
        name: fileName,
        type: input.image.mimeType ?? "image/jpeg",
      } as unknown as Blob);
    }
  }

  let token = await tokenStorage.getAccessToken();
  if (!token) {
    token = getStore().getState().auth.token;
  }

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const rawMessage = payload?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : (rawMessage ?? "Could not update your profile.");
    throw new Error(message);
  }

  return payload.data as User;
}
