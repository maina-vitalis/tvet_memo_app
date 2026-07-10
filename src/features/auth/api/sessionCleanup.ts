import { profileKeys } from "@/src/features/profile/hooks/useProfile";
import { queryClient } from "@/src/shared/store/queryClient";
import { getStore } from "@/src/shared/store/storeRef";
import { tokenStorage } from "./tokenStorage";

/**
 * Wipes all local session state after logout or forced sign-out.
 * Server revocation should happen before calling this when possible.
 */
export async function clearAuthSession(): Promise<void> {
  await tokenStorage.clear();

  queryClient.removeQueries({ queryKey: profileKeys.all });
  queryClient.clear();

  const { logout } = await import("@/src/features/auth/store/authSlice");
  getStore().dispatch(logout());

  try {
    const { persistor } = await import("@/src/shared/store/store");
    await persistor.purge();
  } catch (error) {
    console.warn("[Auth] Failed to purge persisted session", error);
  }
}
