import { apiRequest } from "@/src/lib/api/http";

export type Institution = {
  id: string;
  name: string;
  shortcode: string;
};

type DiscoveryMode = "email" | "shortcode";

type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  mustChangePassword: boolean;
  user: Record<string, unknown>;
};

export async function discoverInstitution(
  query: string,
  mode: DiscoveryMode,
): Promise<Institution> {
  return apiRequest<Institution>("/institutions/discover", {
    method: "POST",
    body: { query, mode },
  });
}

export async function registryLogin(input: {
  institutionId: string;
  admissionNumber: string;
  password: string;
}): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login/registry", {
    method: "POST",
    body: {
      institutionId: input.institutionId,
      admissionNumber: input.admissionNumber.trim(),
      password: input.password,
      deviceType: "mobile",
    },
  });
}

export async function initiateEmailLogin(input: {
  institutionId: string;
  email: string;
}): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/login/email/initiate", {
    method: "POST",
    body: {
      institutionId: input.institutionId,
      email: input.email.trim().toLowerCase(),
    },
  });
}

export async function verifyEmailLogin(input: {
  institutionId: string;
  email: string;
  otp: string;
}): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login/email", {
    method: "POST",
    body: {
      institutionId: input.institutionId,
      email: input.email.trim().toLowerCase(),
      otp: input.otp,
      deviceType: "mobile",
    },
  });
}

export async function changePassword(input: {
  token: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/change-password", {
    method: "POST",
    token: input.token,
    body: {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    },
  });
}

export async function logout(token: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/logout", {
    method: "POST",
    token,
  });
}
