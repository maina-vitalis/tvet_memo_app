import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import {
  SafeAreaListener,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { Uniwind } from "uniwind";

import "@/global.css";
import { useAppfonts } from "@/src/hooks/useAppfonts";
import { AuthProvider } from "@/src/lib/auth-context";
import { ThemeProvider } from "@/src/lib/theme-context";
import { useEffect } from "react";

export default function RootLayout() {
  const [loaded] = useAppfonts();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaListener
        onChange={({ insets }) => {
          Uniwind.updateInsets(insets);
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
            </Stack>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaListener>
    </SafeAreaProvider>
  );
}
