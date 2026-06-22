import { createContext, useCallback, useContext, useMemo, useState } from "react";

import {
  type Institution,
  mockDiscoverInstitution,
  mockSignIn,
} from "@/src/lib/mock-auth";

type DiscoveryMode = "email" | "shortcode";

type AuthContextValue = {
  institution: Institution | null;
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
  clearInstitution: () => void;
  signOut: () => void;
  completeEmailVerification: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const discoverInstitution = useCallback(
    async (query: string, mode: DiscoveryMode) => {
      const resolved = await mockDiscoverInstitution(query, mode);
      setInstitution(resolved);
      return resolved;
    },
    [],
  );

  const signIn = useCallback(async (admissionNumber: string, password: string) => {
    const result = await mockSignIn(admissionNumber, password);

    if (result.success) {
      setIsAuthenticated(true);
    }

    return result;
  }, []);

  const clearInstitution = useCallback(() => {
    setInstitution(null);
    setIsAuthenticated(false);
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const completeEmailVerification = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const value = useMemo(
    () => ({
      institution,
      isAuthenticated,
      discoverInstitution,
      signIn,
      clearInstitution,
      signOut,
      completeEmailVerification,
    }),
    [
      institution,
      isAuthenticated,
      discoverInstitution,
      signIn,
      clearInstitution,
      signOut,
      completeEmailVerification,
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
