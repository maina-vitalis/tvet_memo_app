import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  changePassword,
  discoverInstitution,
  signInWithRegistry,
  signOut,
} from "@/src/features/auth/store/authThunks";
import type { AuthState } from "@/src/features/auth/types/AuthTypes";
import type { User } from "@/src/shared/types";

export type {
  AuthState,
  AuthStatus,
} from "@/src/features/auth/types/AuthTypes";

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isFirstSetup: false,
  otpSentAt: null,
  status: "idle",
  error: null,
  institution: null,
  pendingPassword: null,
  pendingAdmissionNumber: null,
  pendingEmail: null,
  verifiedOtp: null,
};

type SetCredentialsPayload = {
  user: User;
  token: string;
  refreshToken?: string | null;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.isAuthenticated = true;
      state.isFirstSetup = action.payload.user.mustChangePassword;
      state.status = "succeeded";
      state.error = null;
      state.verifiedOtp = null;
      state.pendingPassword = null;

      // Note: actual secure storage is handled in api layer / tokenStorage
      // to avoid storing secrets in persisted redux state if possible.
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isFirstSetup = action.payload.mustChangePassword;
    },

    setFirstSetup: (state, action: PayloadAction<boolean>) => {
      state.isFirstSetup = action.payload;
      if (state.user) {
        state.user.mustChangePassword = action.payload;
      }
    },

    setOtpSentAt: (state, action: PayloadAction<number>) => {
      state.otpSentAt = action.payload;
    },

    setPendingEmail: (state, action: PayloadAction<string | null>) => {
      state.pendingEmail = action.payload;
    },

    setPendingPassword: (state, action: PayloadAction<string | null>) => {
      state.pendingPassword = action.payload;
    },
    setPendingAdmissionNumber: (state, action: PayloadAction<string | null>) => {
      state.pendingAdmissionNumber = action.payload;
    },
    setVerifiedOtp: (state, action: PayloadAction<string | null>) => {
      state.verifiedOtp = action.payload;
    },
    clearInstitution: () => initialState,
    logout: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      .addCase(discoverInstitution.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(discoverInstitution.fulfilled, (state, action) => {
        state.institution = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(discoverInstitution.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Institution not found.";
      })
      .addCase(signInWithRegistry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signInWithRegistry.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isFirstSetup = action.payload.mustChangePassword;
        state.pendingPassword = action.payload.pendingPassword;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(signInWithRegistry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Sign in failed.";
      })
      .addCase(changePassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.pendingPassword = null;
        state.isFirstSetup = false;
        if (state.user) {
          state.user.mustChangePassword = false;
        }
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not update password.";
      })
      .addCase(signOut.fulfilled, () => initialState)
      .addCase(signOut.rejected, () => initialState);
  },
});

export const {
  setCredentials,
  setUser,
  setFirstSetup,
  setOtpSentAt,
  setPendingEmail,
  setPendingPassword,
  setPendingAdmissionNumber,
  setVerifiedOtp,
  clearInstitution,
  logout,
} = authSlice.actions;

export const selectAuthState = (state: { auth: AuthState }) => state.auth;
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAccessToken = (state: { auth: AuthState }) =>
  state.auth.token;
export const selectRefreshToken = (state: { auth: AuthState }) =>
  state.auth.refreshToken;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectIsFirstSetup = (state: { auth: AuthState }) =>
  state.auth.isFirstSetup || (state.auth.user?.mustChangePassword ?? false);
export const selectOtpSentAt = (state: { auth: AuthState }) =>
  state.auth.otpSentAt;
export const selectAuthStatus = (state: { auth: AuthState }) =>
  state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectInstitution = (state: { auth: AuthState }) =>
  state.auth.institution;
export const selectPendingPassword = (state: { auth: AuthState }) =>
  state.auth.pendingPassword;
export const selectPendingEmail = (state: { auth: AuthState }) =>
  state.auth.pendingEmail;
export const selectPendingAdmissionNumber = (state: { auth: AuthState }) =>
  state.auth.pendingAdmissionNumber;
export const selectVerifiedOtp = (state: { auth: AuthState }) =>
  state.auth.verifiedOtp;

export default authSlice.reducer;
