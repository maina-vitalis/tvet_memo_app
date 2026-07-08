import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import {
  SafeAreaListener,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { Uniwind } from "uniwind";

import { PushNotificationBootstrap } from "@/src/features/notifications/components/PushNotificationBootstrap";
import "@/global.css";
import { useAppfonts } from "@/src/shared/hooks/useAppfonts";
import { ThemeProvider } from "@/src/shared/hooks/theme-context";
import { queryClient } from "@/src/shared/store/queryClient";
import { persistor, store } from "@/src/shared/store/store";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useAppfonts();

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
                    options={{ statusBarStyle: "light" }}
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
                </Stack>
              </ThemeProvider>
            </SafeAreaListener>
          </SafeAreaProvider>
        </PersistGate>
      </QueryClientProvider>
    </Provider>
  );
}
