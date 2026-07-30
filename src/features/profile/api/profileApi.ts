import type { User } from "@/src/shared/types";
import apiClient from "@/src/shared/utils/apiClient";
import {
  appendLocalFileToFormData,
  authenticatedMultipartRequest,
} from "@/src/shared/utils/multipartUpload";

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
 */
export async function updateMyProfile(
  input: UpdateMyProfileInput,
): Promise<User> {
  const formData = new FormData();

  if (input.firstName !== undefined) {
    formData.append("firstName", input.firstName);
  }
  if (input.lastName !== undefined) {
    formData.append("lastName", input.lastName);
  }
  if (input.phoneNumber !== undefined) {
    formData.append("phoneNumber", input.phoneNumber);
  }

  if (input.image) {
    await appendLocalFileToFormData(formData, "file", {
      uri: input.image.uri,
      name: input.image.fileName ?? "avatar.jpg",
      mimeType: input.image.mimeType,
    });
  }

  return authenticatedMultipartRequest<User>("/users/me", {
    method: "PATCH",
    formData,
    fallbackError: "Could not update your profile.",
  });
}
