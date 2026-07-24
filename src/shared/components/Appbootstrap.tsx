import { selectIsFirstSetup, useAuth } from "@/src/features/auth";
import { AUTH_ROUTES } from "@/src/features/auth/navigation";
import { loadTokensFromSecureStorage } from "@/src/features/auth/store/authBoot";
import { PushNotificationBootstrap } from "@/src/features/notifications";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { ThemeProvider } from "../hooks/theme-context";
import { useAppSelector } from "../store/hooks";
import { getStore } from "../store/storeRef";

const AppBootstrap = () => {
  const isFirstSetup = useAppSelector(selectIsFirstSetup);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // [REFRESH TOKENS] On boot, restore tokens from secure storage into redux before deciding navigation.
    // This runs in parallel with the boot animation.
    loadTokensFromSecureStorage().catch(() => {});

    //checking if the current user is authenticated
    const currentIsAuthed = getStore().getState().auth.isAuthenticated;

    //checking if its the first set up
    const currentIsFirstSetup =
      getStore().getState().auth.isFirstSetup ||
      (getStore().getState().auth.user?.mustChangePassword ?? false);

    if (currentIsAuthed) {
      router.replace(
        currentIsFirstSetup ? AUTH_ROUTES.resetPassword : AUTH_ROUTES.home,
      );
      return;
    }
  }, [isFirstSetup, isAuthenticated]);
  return (
    <ThemeProvider>
      <PushNotificationBootstrap />
      <Stack screenOptions={{ headerShown: false }}>
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
