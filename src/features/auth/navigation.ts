import type { Href } from "expo-router";

export const AUTH_ROUTE_PATHS = {
  tenantDiscovery: "/(auth)/tenant-discovery",
  login: "/(auth)/login",
  loginRegistry: "/(auth)/login-registry",
  verifyEmail: "/(auth)/verify-email",
  password: "/(auth)/password",
  resetPassword: "/(auth)/reset-password",
  home: "/(tabs)/home",
} as const;

export const AUTH_ROUTES: Record<keyof typeof AUTH_ROUTE_PATHS, Href> = {
  tenantDiscovery: AUTH_ROUTE_PATHS.tenantDiscovery,
  login: AUTH_ROUTE_PATHS.login,
  loginRegistry: AUTH_ROUTE_PATHS.loginRegistry,
  verifyEmail: AUTH_ROUTE_PATHS.verifyEmail,
  password: AUTH_ROUTE_PATHS.password,
  resetPassword: AUTH_ROUTE_PATHS.resetPassword,
  home: AUTH_ROUTE_PATHS.home,
};