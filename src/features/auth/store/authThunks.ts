import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  changePassword as changePasswordRequest,
  discoverInstitution as discoverInstitutionRequest,
  logout as logoutRequest,
  registryLogin,
  type DiscoveryMode,
  type Institution,
} from "@/src/features/auth/api/authApi";
import { clearAuthSession } from "@/src/features/auth/api/sessionCleanup";
import { tokenStorage } from "@/src/features/auth/api/tokenStorage";
import type { AuthState } from "@/src/features/auth/types/AuthTypes";
import type { User } from "@/src/shared/types";
import { toApiError } from "@/src/shared/utils/apiClient";

type AuthRootState = {
  auth: AuthState;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return toApiError(error, fallback).message;
}

export const discoverInstitution = createAsyncThunk<
  Institution,
  { query: string; mode: DiscoveryMode },
  { rejectValue: string }
>("auth/discoverInstitution", async ({ query, mode }, { rejectWithValue }) => {
  try {
    return await discoverInstitutionRequest(query, mode);
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(
        error,
        "Institution not found. Check your email domain or shortcode.",
      ),
    );
  }
});

type RegistryLoginResult = {
  accessToken: string;
  refreshToken?: string;
  user: User;
  mustChangePassword: boolean;
  pendingPassword: string | null;
};

export const signInWithRegistry = createAsyncThunk<
  RegistryLoginResult,
  { admissionNumber: string; password: string },
  { state: AuthRootState; rejectValue: string }
>(
  "auth/signInWithRegistry",
  async ({ admissionNumber, password }, { getState, rejectWithValue }) => {
    const institution = getState().auth.institution;

    if (!institution?.id) {
      return rejectWithValue("Institution not found. Please start again.");
    }

    try {
      const session = await registryLogin({ admissionNumber, password });

      return {
        accessToken: session.token,
        refreshToken: session.refreshToken ?? undefined,
        user: session.user,
        mustChangePassword: session.user.mustChangePassword,
        pendingPassword: session.user.mustChangePassword ? password : null,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Invalid admission number or password."),
      );
    }
  },
);

export const changePassword = createAsyncThunk<
  void,
  { newPassword: string },
  { state: AuthRootState; rejectValue: string }
>(
  "auth/changePassword",
  async ({ newPassword }, { getState, rejectWithValue }) => {
    const { token, pendingPassword } = getState().auth;

    if (!token || !pendingPassword) {
      return rejectWithValue("Session expired. Please sign in again.");
    }

    try {
      await changePasswordRequest({
        currentPassword: pendingPassword,
        newPassword,
      });
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Could not update password."),
      );
    }
  },
);

export const signOut = createAsyncThunk<void, void>(
  "auth/signOut",
  async () => {
    const refreshToken = await tokenStorage.getRefreshToken();

    if (refreshToken) {
      try {
        const { unregisterPushTokenOnLogout } =
          await import("@/src/features/notifications/api/pushTokenLifecycle");
        await unregisterPushTokenOnLogout();
        await logoutRequest();
      } catch {
        // Fall through to local cleanup even when the server logout fails.
      }
    }

    await clearAuthSession();
  },
);
