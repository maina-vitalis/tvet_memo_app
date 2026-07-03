import apiClient from "@/src/shared/utils/apiClient";
import { getStore } from "@/src/shared/store/storeRef";
import type { AuthSession, User } from "@/src/shared/types";
import tokenStorage from "@/src/features/auth/api/tokenStorage"; // [REFRESH TOKENS] secure store
import { getOrCreateDeviceId } from "./device"; // [REFRESH TOKENS] stable device id

export type Institution = {
  id: string;
  name: string;
  shortcode: string;
};

export type DiscoveryMode = "email" | "shortcode";

type BackendLoginResponse = {
  accessToken: string;
  refreshToken: string; // [REFRESH TOKENS]
  tokenType: "Bearer";
  expiresIn: number; // seconds
  mustChangePassword: boolean;
  user: User;
};

function mapSession(response: BackendLoginResponse): AuthSession {
  // [REFRESH TOKENS] Immediately persist both tokens to secure storage
  // The caller (thunk) will also dispatch to redux.
  tokenStorage.setTokens(response.accessToken, response.refreshToken).catch(() => {});
  return {
    token: response.accessToken,
    refreshToken: response.refreshToken,
    user: response.user,
  };
}

function getAuthContext() {
  const { institution, verifiedOtp } = getStore().getState().auth;

  if (!institution?.id) {
    throw new Error("Institution not found. Please start again.");
  }

  return { institutionId: institution.id, verifiedOtp };
}

export async function discoverInstitution(
  query: string,
  mode: DiscoveryMode,
): Promise<Institution> {
  const { data } = await apiClient.post<Institution>("/institutions/discover", {
    query,
    mode,
  });

  return data;
}

export async function checkEmail(
  email: string,
): Promise<{ exists: boolean; isFirstSetup: boolean }> {
  const { institutionId } = getAuthContext();
  const normalizedEmail = email.trim().toLowerCase();

  const { data } = await apiClient.post<{
    exists: boolean;
    isFirstSetup: boolean;
  }>("/auth/login/email/check", {
    institutionId,
    email: normalizedEmail,
  });

  return {
    exists: Boolean(data.exists),
    isFirstSetup: Boolean(data.isFirstSetup),
  };
}

export async function sendOtp(email: string): Promise<{ sentAt: number }> {
  const { institutionId } = getAuthContext();
  const normalizedEmail = email.trim().toLowerCase();

  await apiClient.post("/auth/login/email/initiate", {
    institutionId,
    email: normalizedEmail,
  });

  return { sentAt: Date.now() };
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<{ valid: boolean; isFirstSetup: boolean }> {
  const { institutionId } = getAuthContext();
  const normalizedEmail = email.trim().toLowerCase();

  const { data } = await apiClient.post<{
    verified: boolean;
    isFirstSetup: boolean;
  }>("/auth/login/email/validate-otp", {
    institutionId,
    email: normalizedEmail,
    otp,
  });

  return {
    valid: data.verified,
    isFirstSetup: data.isFirstSetup,
  };
}

export async function setPassword(
  email: string,
  password: string,
  otp?: string,
): Promise<AuthSession> {
  const { institutionId, verifiedOtp } = getAuthContext();
  const normalizedEmail = email.trim().toLowerCase();
  const otpCode = otp ?? verifiedOtp;
  const deviceId = await getOrCreateDeviceId();

  if (!otpCode) {
    throw new Error("Session expired. Please verify your email again.");
  }

  const { data } = await apiClient.post<BackendLoginResponse>(
    "/auth/login/email/complete-setup",
    {
      institutionId,
      email: normalizedEmail,
      otp: otpCode,
      password,
      deviceType: "mobile",
      deviceId,
    },
  );

  return mapSession(data);
}

export async function login(
  email: string,
  password: string,
): Promise<AuthSession> {
  const { institutionId } = getAuthContext();
  const normalizedEmail = email.trim().toLowerCase();
  const deviceId = await getOrCreateDeviceId();

  const { data } = await apiClient.post<BackendLoginResponse>(
    "/auth/login/email/password",
    {
      institutionId,
      email: normalizedEmail,
      password,
      deviceType: "mobile",
      deviceId,
    },
  );

  return mapSession(data);
}

export async function refreshToken(
  _refreshToken: string,
): Promise<{ token: string }> {
  throw new Error("Token refresh is not supported yet.");
}

export async function logout(): Promise<void> {
  const refresh = await tokenStorage.getRefreshToken(); // [REFRESH TOKENS] prefer sending the revocable one

  try {
    await apiClient.post("/auth/logout", refresh ? { refreshToken: refresh } : undefined);
  } catch {
    // Local session is cleared by the caller either way.
  } finally {
    await tokenStorage.clear();
  }
}

export async function registryLogin(input: {
  admissionNumber: string;
  password: string;
}): Promise<AuthSession> {
  const { institutionId } = getAuthContext();
  const deviceId = await getOrCreateDeviceId();

  const { data } = await apiClient.post<BackendLoginResponse>(
    "/auth/login/registry",
    {
      institutionId,
      admissionNumber: input.admissionNumber.trim(),
      password: input.password,
      deviceType: "mobile",
      deviceId, // [REFRESH TOKENS] send stable device identifier
    },
  );

  return mapSession(data);
}

export async function completeAccountSetup(
  token: string,
  password: string,
): Promise<AuthSession> {
  const { data } = await apiClient.post<BackendLoginResponse>(
    "/auth/setup/complete",
    {
      token,
      password,
      deviceType: "mobile",
    },
  );

  return mapSession(data);
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    "/auth/change-password",
    {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    },
  );

  return data;
}

/**
 * [REFRESH TOKENS]
 * Explicit refresh call. The axios interceptor will normally handle this automatically on 401.
 * Exposed for proactive refresh (before expiry) or manual use.
 */
export async function refreshAccessToken(): Promise<AuthSession> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const { data } = await apiClient.post<BackendLoginResponse>("/auth/refresh", {
    refreshToken,
  });

  // apiClient interceptor already updated storage + redux on success, but return for caller
  return mapSession(data);
}
