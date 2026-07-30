import { router } from "expo-router";
import { Platform } from "react-native";

import { clearAuthSession } from "@/src/features/auth/api/sessionCleanup";
import { tokenStorage } from "@/src/features/auth/api/tokenStorage";
import { AUTH_ROUTES } from "@/src/features/auth/navigation";
import { setCredentials } from "@/src/features/auth/store/authSlice";
import { getStore } from "@/src/shared/store/storeRef";
import { API_BASE_URL } from "@/src/shared/utils/config";
import { getSecondsUntilExpiry } from "@/src/shared/utils/jwt";

const MIME_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/heic": "image/jpeg",
  "image/heif": "image/jpeg",
};

export function normalizeMimeType(
  mimeType: string | null | undefined,
  fileName: string,
): string {
  const trimmed = mimeType?.trim().toLowerCase();
  if (trimmed && trimmed !== "application/octet-stream") {
    return MIME_ALIASES[trimmed] ?? trimmed;
  }

  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
    case "heif":
      return "image/jpeg";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

export type LocalFileInput = {
  uri: string;
  name: string;
  mimeType?: string | null;
};

export async function appendLocalFileToFormData(
  formData: FormData,
  fieldName: string,
  file: LocalFileInput,
): Promise<void> {
  const mimeType = normalizeMimeType(file.mimeType, file.name);

  if (Platform.OS === "web") {
    const picked = await fetch(file.uri);
    const blob = await picked.blob();
    const typedBlob =
      blob.type && blob.type !== "application/octet-stream"
        ? blob
        : new Blob([blob], { type: mimeType });

    formData.append(fieldName, typedBlob, file.name);
    return;
  }

  formData.append(fieldName, {
    uri: file.uri,
    name: file.name,
    type: mimeType,
  } as unknown as Blob);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json().catch(() => null);
  const payload = json?.data ?? json;
  const newAccess = payload?.accessToken as string | undefined;
  const newRefresh = payload?.refreshToken as string | undefined;

  if (!newAccess) {
    return null;
  }

  if (newRefresh) {
    await tokenStorage.setTokens(newAccess, newRefresh);
  } else {
    await tokenStorage.setAccessToken(newAccess);
  }

  const currentUser = getStore().getState().auth.user;
  if (currentUser) {
    getStore().dispatch(
      setCredentials({
        user: currentUser,
        token: newAccess,
        refreshToken: newRefresh,
      }),
    );
  }

  return newAccess;
}

async function resolveAccessToken(): Promise<string | null> {
  let token = await tokenStorage.getAccessToken();
  if (!token) {
    token = getStore().getState().auth.token;
  }

  const secondsLeft = getSecondsUntilExpiry(token);
  if (secondsLeft !== null && secondsLeft < 90) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return refreshed;
    }
  }

  return token;
}

export async function authenticatedMultipartRequest<T>(
  path: string,
  options: {
    method: "POST" | "PATCH";
    formData: FormData;
    fallbackError: string;
  },
): Promise<T> {
  let token = await resolveAccessToken();

  const send = (authToken: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      method: options.method,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      body: options.formData,
    });

  let response = await send(token);

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await send(refreshed);
    } else {
      await clearAuthSession();
      router.replace(AUTH_ROUTES.login);
      throw new Error("Your session expired. Please sign in again.");
    }
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const rawMessage = json?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : (rawMessage ?? options.fallbackError);
    throw new Error(message);
  }

  return (json?.data ?? json) as T;
}
