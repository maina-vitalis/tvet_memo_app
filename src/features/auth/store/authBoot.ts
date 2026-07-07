/**
 * [REFRESH TOKENS + RN BOOT]
 * Loads tokens from secure storage into Redux on app start.
 * This ensures that after a cold start the app knows it is authenticated
 * without relying on potentially insecure persisted redux state for the actual secrets.
 *
 * Call this early (SplashScreen or root layout after PersistGate).
 */

import { setCredentials } from "./authSlice";
import tokenStorage from "../api/tokenStorage";
import { getStore } from "@/src/shared/store/storeRef";
import type { User } from "@/src/shared/types";

export async function loadTokensFromSecureStorage(): Promise<boolean> {
  try {
    const [access, refresh] = await Promise.all([
      tokenStorage.getAccessToken(),
      tokenStorage.getRefreshToken(),
    ]);

    if (!access) return false;

    const store = getStore();
    const existingUser = store.getState().auth.user;

    // If we have a persisted user, keep it. Otherwise we may need /me later.
    // For now we set a minimal credential so interceptors + isAuthenticated work.
    if (existingUser) {
      store.dispatch(
        setCredentials({
          user: existingUser,
          token: access,
          refreshToken: refresh ?? undefined,
        }),
      );
    } else {
      // Create a placeholder user object. The first /me or profile fetch will fill real data.
      // This is acceptable because protected screens usually call profile quickly.
      const placeholderUser = {
        id: "boot",
        institutionId: "",
        role: "TRAINEE",
        departmentId: null,
        firstName: "",
        lastName: "",
        email: "",
        admissionNumber: null,
        staffNumber: null,
        phoneNumber: null,
        totpEnabled: false,
        fcmToken: null,
        preferredLang: "en",
        avatarUrl: null,
        isActive: true,
        mustChangePassword: false,
        lastLoginAt: null,
        createdAt: "",
        updatedAt: "",
      } as unknown as User;

      store.dispatch(
        setCredentials({
          user: placeholderUser,
          token: access,
          refreshToken: refresh ?? undefined,
        }),
      );
    }

    return true;
  } catch (e) {
    console.warn("[AuthBoot] Failed to load tokens from secure storage", e);
    return false;
  }
}
