import type { Href } from "expo-router";

export const AUTH_ROUTE_PATHS = {
  tenantDiscovery: "/(auth)/tenant-discovery",
  login: "/(auth)/login",
  loginRegistry: "/(auth)/login-registry",
  admissionNumber: "/(auth)/admission-number",
  verifyEmail: "/(auth)/verify-email",
  password: "/(auth)/password",
  resetPassword: "/(auth)/reset-password",
  home: "/(tabs)/home",
} as const;

/**
 * Single place that decides where a freshly authenticated user lands.
 * Every login path must go through this so a user who still owes a password
 * change can never reach the app with a temporary password.
 */
export function resolvePostAuthRoute(mustChangePassword: boolean): Href {
  return mustChangePassword
    ? AUTH_ROUTE_PATHS.resetPassword
    : AUTH_ROUTE_PATHS.home;
}

export const AUTH_ROUTES: Record<keyof typeof AUTH_ROUTE_PATHS, Href> = {
  tenantDiscovery: AUTH_ROUTE_PATHS.tenantDiscovery,
  login: AUTH_ROUTE_PATHS.login,
  loginRegistry: AUTH_ROUTE_PATHS.loginRegistry,
  admissionNumber: AUTH_ROUTE_PATHS.admissionNumber,
  verifyEmail: AUTH_ROUTE_PATHS.verifyEmail,
  password: AUTH_ROUTE_PATHS.password,
  resetPassword: AUTH_ROUTE_PATHS.resetPassword,
  home: AUTH_ROUTE_PATHS.home,
};
