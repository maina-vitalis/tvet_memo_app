import { resolvePostAuthRoute } from "@/src/features/auth/navigation";
import { loadTokensFromSecureStorage } from "@/src/features/auth/store/authBoot";
import { getHasSeenWelcome } from "@/src/features/auth/storage/onboardingStorage";
import { PushNotificationBootstrap } from "@/src/features/notifications";
import { router, Stack } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { ThemeProvider } from "../hooks/theme-context";
import { getStore } from "../store/storeRef";

const AppBootstrap = () => {
  const hasNavigatedRef = useRef(false);

  const resolveInitialRoute = useCallback(async () => {
    // 1. Try to restore tokens from secure storage (SecureStore / localStorage)
    const restored = await loadTokensFromSecureStorage().catch(() => false);

    if (restored) {
      const { auth } = getStore().getState();

      router.replace(
        resolvePostAuthRoute(
          auth.isFirstSetup || (auth.user?.mustChangePassword ?? false),
        ),
      );
      hasNavigatedRef.current = true;
      return;
    }

    // 2. No valid session — decide between welcome and auth screens
    const hasSeenWelcome = await getHasSeenWelcome().catch(() => false);

    router.replace(
      hasSeenWelcome ? "/(auth)/tenant-discovery" : "/(auth)/welcome",
    );
    hasNavigatedRef.current = true;
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Tokens live in SecureStore only, so the session has to be restored before
    // we can decide where a cold start lands. Routing after login is owned by
    // the individual auth flows, so this only runs once on mount.
    const boot = async () => {
      if (!isMounted) return;
      await resolveInitialRoute();
    };

    void boot();

    return () => {
      isMounted = false;
    };
  }, [resolveInitialRoute]);

  // On web: re-check auth when the browser tab regains focus.
  // This fixes the issue where logging in, switching tabs, and coming back
  // does not detect the session until a manual page refresh.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Only re-check if we already completed the initial boot, so we don't
        // double-navigate during the first mount.
        if (hasNavigatedRef.current) {
          void resolveInitialRoute();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [resolveInitialRoute]);

  return (
    <ThemeProvider>
      <PushNotificationBootstrap />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ statusBarStyle: "dark" }} />
        <Stack.Screen name="(auth)" options={{ statusBarStyle: "dark" }} />
        <Stack.Screen name="memo/[id]" options={{ statusBarStyle: "dark" }} />
        <Stack.Screen name="memo/create" options={{ statusBarStyle: "dark" }} />
        <Stack.Screen
          name="edit-profile"
          options={{ statusBarStyle: "dark" }}
        />
      </Stack>
    </ThemeProvider>
  );
};

export default AppBootstrap;

