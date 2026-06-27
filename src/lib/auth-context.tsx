import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

import {
  changePassword as changePasswordRequest,
  discoverInstitution as discoverInstitutionRequest,
  initiateEmailLogin,
  logout as logoutRequest,
  registryLogin,
  verifyEmailLogin,
  type Institution,
} from "@/src/lib/api/auth-api";
import { ApiError } from "@/src/lib/api/http";

type DiscoveryMode = "email" | "shortcode";

type AuthContextValue = {
  institution: Institution | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  discoverInstitution: (
    query: string,
    mode: DiscoveryMode,
  ) => Promise<Institution>;
  signIn: (
    admissionNumber: string,
    password: string,
  ) => Promise<
    | { success: true; mustResetPassword: boolean }
    | { success: false; error: string }
  >;
  sendEmailVerification: (email: string) => Promise<void>;
  verifyEmailOtp: (
    email: string,
    otp: string,
  ) => Promise<{ success: true } | { success: false; error: string }>;
  changePassword: (
    newPassword: string,
  ) => Promise<{ success: true } | { success: false; error: string }>;
  clearInstitution: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [institution, setInstitutionState] = useState<Institution | null>(null);
  const institutionRef = useRef<Institution | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setInstitution = useCallback((value: Institution | null) => {
    institutionRef.current = value;
    setInstitutionState(value);
  }, []);

  const discoverInstitution = useCallback(
    async (query: string, mode: DiscoveryMode) => {
      const resolved = await discoverInstitutionRequest(query, mode);
      setInstitution(resolved);
      return resolved;
    },
    [setInstitution],
  );

  const signIn = useCallback(
    async (admissionNumber: string, password: string) => {
      const currentInstitution = institutionRef.current;

      if (!currentInstitution?.id) {
        return {
          success: false as const,
          error: "Institution not found. Please start again.",
        };
      }

      try {
        const result = await registryLogin({
          institutionId: currentInstitution.id,
          admissionNumber,
          password,
        });

        setAccessToken(result.accessToken);
        setIsAuthenticated(true);

        if (result.mustChangePassword) {
          setCurrentPassword(password);
        } else {
          setCurrentPassword(null);
        }

        return {
          success: true as const,
          mustResetPassword: result.mustChangePassword,
        };
      } catch (error) {
        return {
          success: false as const,
          error: getErrorMessage(
            error,
            "Invalid admission number or password.",
          ),
        };
      }
    },
    [],
  );

  const sendEmailVerification = useCallback(
    async (email: string) => {
      const currentInstitution = institutionRef.current;

      if (!currentInstitution?.id) {
        throw new Error("Institution not found. Please start again.");
      }

      await initiateEmailLogin({
        institutionId: currentInstitution.id,
        email,
      });
    },
    [],
  );

  const verifyEmailOtp = useCallback(
    async (email: string, otp: string) => {
      const currentInstitution = institutionRef.current;

      if (!currentInstitution?.id) {
        return {
          success: false as const,
          error: "Institution not found. Please start again.",
        };
      }

      try {
        const result = await verifyEmailLogin({
          institutionId: currentInstitution.id,
          email,
          otp,
        });

        setAccessToken(result.accessToken);
        setCurrentPassword(null);
        setIsAuthenticated(true);

        return { success: true as const };
      } catch (error) {
        return {
          success: false as const,
          error: getErrorMessage(
            error,
            "Invalid verification code. Please try again.",
          ),
        };
      }
    },
    [],
  );

  const changePassword = useCallback(
    async (newPassword: string) => {
      if (!accessToken || !currentPassword) {
        return {
          success: false as const,
          error: "Session expired. Please sign in again.",
        };
      }

      try {
        await changePasswordRequest({
          token: accessToken,
          currentPassword: currentPassword,
          newPassword,
        });

        setCurrentPassword(null);
        return { success: true as const };
      } catch (error) {
        return {
          success: false as const,
          error: getErrorMessage(error, "Could not update password."),
        };
      }
    },
    [accessToken, currentPassword],
  );

  const clearInstitution = useCallback(() => {
    setInstitution(null);
    setAccessToken(null);
    setCurrentPassword(null);
    setIsAuthenticated(false);
  }, [setInstitution]);

  const signOut = useCallback(async () => {
    if (accessToken) {
      try {
        await logoutRequest(accessToken);
      } catch {
        // Ignore logout errors — clear local session anyway.
      }
    }

    clearInstitution();
  }, [accessToken, clearInstitution]);

  const value = useMemo(
    () => ({
      institution,
      accessToken,
      isAuthenticated,
      discoverInstitution,
      signIn,
      sendEmailVerification,
      verifyEmailOtp,
      changePassword,
      clearInstitution,
      signOut,
    }),
    [
      institution,
      accessToken,
      isAuthenticated,
      discoverInstitution,
      signIn,
      sendEmailVerification,
      verifyEmailOtp,
      changePassword,
      clearInstitution,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export type { Institution };
