import { useCallback } from "react";

import type { Institution } from "@/src/features/auth/api/authApi";
import { clearInstitution as clearInstitutionAction } from "@/src/features/auth/store/authSlice";
import {
  changePassword as changePasswordThunk,
  discoverInstitution as discoverInstitutionThunk,
  signInWithRegistry,
  signOut as signOutThunk,
} from "@/src/features/auth/store/authThunks";
import type { DiscoveryMode } from "@/src/features/auth/types/AuthTypes";
import {
  selectAccessToken,
  selectInstitution,
  selectIsAuthenticated,
} from "@/src/features/auth/store/authSelectors";
import { useAppDispatch, useAppSelector } from "@/src/shared/store/hooks";

export function useAuth() {
  const dispatch = useAppDispatch();
  const institution = useAppSelector(selectInstitution);
  const accessToken = useAppSelector(selectAccessToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const discoverInstitution = useCallback(
    async (query: string, mode: DiscoveryMode): Promise<Institution> => {
      const result = await dispatch(
        discoverInstitutionThunk({ query, mode }),
      );

      if (discoverInstitutionThunk.rejected.match(result)) {
        throw new Error(
          (result.payload as string) ??
            "Institution not found. Check your email domain or shortcode.",
        );
      }

      return result.payload;
    },
    [dispatch],
  );

  const signIn = useCallback(
    async (admissionNumber: string, password: string) => {
      const result = await dispatch(
        signInWithRegistry({ admissionNumber, password }),
      );

      if (signInWithRegistry.rejected.match(result)) {
        return {
          success: false as const,
          error:
            (result.payload as string) ??
            "Invalid admission number or password.",
        };
      }

      return {
        success: true as const,
        mustResetPassword: result.payload.mustChangePassword,
      };
    },
    [dispatch],
  );

  const changePassword = useCallback(
    async (newPassword: string, currentPassword?: string) => {
      const result = await dispatch(
        changePasswordThunk({ newPassword, currentPassword }),
      );

      if (changePasswordThunk.rejected.match(result)) {
        return {
          success: false as const,
          error:
            (result.payload as string) ?? "Could not update password.",
        };
      }

      return { success: true as const };
    },
    [dispatch],
  );

  const clearInstitution = useCallback(() => {
    dispatch(clearInstitutionAction());
  }, [dispatch]);

  const signOut = useCallback(async () => {
    await dispatch(signOutThunk());
  }, [dispatch]);

  return {
    institution,
    accessToken,
    isAuthenticated,
    discoverInstitution,
    signIn,
    changePassword,
    clearInstitution,
    signOut,
  };
}

export type { Institution };