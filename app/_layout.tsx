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

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useAppfonts();

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
              <Stack.Screen
                name="index"
                options={{
                  statusBarStyle: "light",
                  statusBarBackgroundColor: "#1a365d",
                }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{
                  statusBarStyle: "dark",
                  statusBarBackgroundColor: "#ffffff",
                }}
              />
              <Stack.Screen
                name="(auth)"
                options={{
                  statusBarStyle: "dark",
                  statusBarBackgroundColor: "#ffffff",
                }}
              />
              <Stack.Screen
                name="memo/[id]"
                options={{
                  statusBarStyle: "dark",
                  statusBarBackgroundColor: "#ffffff",
                }}
              />
            </Stack>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaListener>
    </SafeAreaProvider>
  );
}
