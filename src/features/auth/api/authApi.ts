import apiClient from "@/src/shared/utils/apiClient";
import { getStore } from "@/src/shared/store/storeRef";
import type { AuthSession, User } from "@/src/shared/types";
import { tokenStorage } from "@/src/features/auth/api/tokenStorage";
import { getOrCreateDeviceId } from "./device";

export type Institution = {
  id: string;
  name: string;
  shortcode: string;
};

export type DiscoveryMode = "email" | "shortcode";

type BackendLoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  mustChangePassword: boolean;
  user: User;
};

function mapSession(response: BackendLoginResponse): AuthSession {
  tokenStorage
    .setTokens(response.accessToken, response.refreshToken)
    .catch(() => {});
  return {
    token: response.accessToken,
    refreshToken: response.refreshToken,
    user: response.user,
  };
}

function getAuthContext() {
  const { institution } = getStore().getState().auth;

  if (!institution?.id) {
    throw new Error("Institution not found. Please start again.");
  }

  return { institutionId: institution.id };
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

//email checkup
export async function checkEmail(email: string): Promise<{
  exists: boolean;
  emailVerified: boolean;
  pendingVerification: boolean;
}> {
  const { institutionId } = getAuthContext();
  const normalizedEmail = email.trim().toLowerCase();

  const { data } = await apiClient.post<{
    exists: boolean;
    emailVerified: boolean;
    pendingVerification: boolean;
  }>("/auth/login/email/check", {
    institutionId,
    email: normalizedEmail,
  });

  return {
    exists: Boolean(data.exists),
    emailVerified: Boolean(data.emailVerified),
    pendingVerification: Boolean(data.pendingVerification),
  };
}

// Registration already emails the first verification code, so it reports
// `sentAt` exactly like sendOtp does — the OTP screen relies on this to avoid
// requesting a second code that would invalidate the one already delivered.
export async function signupRegister(
  email: string,
  password: string,
): Promise<{ message: string; sentAt: number }> {
  const { institutionId } = getAuthContext();
  const normalizedEmail = email.trim().toLowerCase();

  const { data } = await apiClient.post<{ message: string }>(
    "/auth/signup/register",
    {
      institutionId,
      email: normalizedEmail,
      password,
    },
  );

  // Local clock on purpose: the resend countdown is rendered against Date.now(),
  // so a server timestamp would drift with device clock skew.
  return { ...data, sentAt: Date.now() };
}

export async function sendOtp(email: string): Promise<{ sentAt: number }> {
  const { institutionId } = getAuthContext();
  const normalizedEmail = email.trim().toLowerCase();

  await apiClient.post("/auth/signup/resend-otp", {
    institutionId,
    email: normalizedEmail,
  });

  return { sentAt: Date.now() };
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<AuthSession> {
  const { institutionId } = getAuthContext();
  const normalizedEmail = email.trim().toLowerCase();
  const deviceId = await getOrCreateDeviceId();

  const { data } = await apiClient.post<BackendLoginResponse>(
    "/auth/signup/verify",
    {
      institutionId,
      email: normalizedEmail,
      otp,
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
  const refresh = await tokenStorage.getRefreshToken();

  try {
    await apiClient.post(
      "/auth/logout",
      refresh ? { refreshToken: refresh } : undefined,
    );
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
      deviceId,
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

export async function refreshAccessToken(): Promise<AuthSession> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const { data } = await apiClient.post<BackendLoginResponse>("/auth/refresh", {
    refreshToken,
  });

  return mapSession(data);
}
