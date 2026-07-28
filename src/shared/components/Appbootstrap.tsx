import { resolvePostAuthRoute } from "@/src/features/auth/navigation";
import { loadTokensFromSecureStorage } from "@/src/features/auth/store/authBoot";
import { PushNotificationBootstrap } from "@/src/features/notifications";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { ThemeProvider } from "../hooks/theme-context";
import { getStore } from "../store/storeRef";

const AppBootstrap = () => {
  useEffect(() => {
    let isMounted = true;

    // Tokens live in SecureStore only, so the session has to be restored before
    // we can decide where a cold start lands. Routing after login is owned by
    // the individual auth flows, so this only runs once on mount.
    const restoreSession = async () => {
      const restored = await loadTokensFromSecureStorage().catch(() => false);

      if (!isMounted || !restored) {
        return;
      }

      const { auth } = getStore().getState();

      router.replace(
        resolvePostAuthRoute(
          auth.isFirstSetup || (auth.user?.mustChangePassword ?? false),
        ),
      );
    };

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);
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
