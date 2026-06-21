import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import {
  SafeAreaListener,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { Uniwind } from "uniwind";

import "@/global.css";
import { GluestackUIProvider } from "@/src/components/ui/gluestack-ui-provider";
import { useAppfonts } from "@/src/hooks/useAppfonts";
import { AuthProvider } from "@/src/lib/auth-context";
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
        <GluestackUIProvider mode="light">
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
            </Stack>
            <StatusBar style="auto" />
          </AuthProvider>
        </GluestackUIProvider>
      </SafeAreaListener>
    </SafeAreaProvider>
  );
}
