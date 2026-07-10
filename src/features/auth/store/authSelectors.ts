import type { AuthState } from "@/src/features/auth/types/AuthTypes";

type AuthSelectorState = { auth: AuthState };

export const selectAuthState = (state: AuthSelectorState) => state.auth;
export const selectCurrentUser = (state: AuthSelectorState) => state.auth.user;
export const selectAuthToken = (state: AuthSelectorState) => state.auth.token;
export const selectAccessToken = selectAuthToken;
export const selectRefreshToken = (state: AuthSelectorState) =>
  state.auth.refreshToken;
export const selectIsAuthenticated = (state: AuthSelectorState) =>
  state.auth.isAuthenticated;
export const selectIsFirstSetup = (state: AuthSelectorState) =>
  state.auth.isFirstSetup || (state.auth.user?.mustChangePassword ?? false);
export const selectOtpSentAt = (state: AuthSelectorState) => state.auth.otpSentAt;
export const selectAuthStatus = (state: AuthSelectorState) => state.auth.status;
export const selectAuthError = (state: AuthSelectorState) => state.auth.error;
export const selectInstitution = (state: AuthSelectorState) =>
  state.auth.institution;
export const selectPendingPassword = (state: AuthSelectorState) =>
  state.auth.pendingPassword;
export const selectPendingEmail = (state: AuthSelectorState) =>
  state.auth.pendingEmail;
export const selectPendingAdmissionNumber = (state: AuthSelectorState) =>
  state.auth.pendingAdmissionNumber;
export const selectVerifiedOtp = (state: AuthSelectorState) =>
  state.auth.verifiedOtp;
