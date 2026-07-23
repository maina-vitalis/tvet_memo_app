import { QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import {
  SafeAreaListener,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Uniwind } from "uniwind";

import "@/global.css";
import { PushNotificationBootstrap } from "@/src/features/notifications/components/PushNotificationBootstrap";
import { ThemeProvider } from "@/src/shared/hooks/theme-context";
import { useAppfonts } from "@/src/shared/hooks/useAppfonts";
import { queryClient } from "@/src/shared/store/queryClient";
import { persistor, store } from "@/src/shared/store/store";
import { useEffect } from "react";
import { selectIsFirstSetup, useAuth } from "../features/auth";
import { AUTH_ROUTES } from "../features/auth/navigation";
import { loadTokensFromSecureStorage } from "../features/auth/store/authBoot";
import { useAppSelector } from "../shared/store/hooks";
import { getStore } from "../shared/store/storeRef";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const isFirstSetup = useAppSelector(selectIsFirstSetup);
  const { isAuthenticated } = useAuth();
  const [loaded] = useAppfonts();

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

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <SafeAreaListener
              onChange={({ insets }) => {
                Uniwind.updateInsets(insets);
              }}
            >
              <ThemeProvider>
                <PushNotificationBootstrap />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen
                    name="index"
                    options={{ statusBarStyle: "dark" }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ statusBarStyle: "dark" }}
                  />
                  <Stack.Screen
                    name="(auth)"
                    options={{ statusBarStyle: "dark" }}
                  />
                  <Stack.Screen
                    name="memo/[id]"
                    options={{ statusBarStyle: "dark" }}
                  />
                  <Stack.Screen
                    name="memo/create"
                    options={{ statusBarStyle: "dark" }}
                  />
                  <Stack.Screen
                    name="edit-profile"
                    options={{ statusBarStyle: "dark" }}
                  />
                </Stack>
              </ThemeProvider>
            </SafeAreaListener>
          </SafeAreaProvider>
        </PersistGate>
      </QueryClientProvider>
    </Provider>
  );
}
