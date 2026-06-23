import { Stack } from "expo-router";

import { ScreenStatusBar } from "@/src/components/screen-status-bar";

export default function AuthLayout() {
  return (
    <>
      <ScreenStatusBar style="dark" backgroundColor="#ffffff" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { flex: 1 },
        }}
      >
        <Stack.Screen name="tenant-discovery" />
        <Stack.Screen name="login-registry" />
        <Stack.Screen
          name="reset-password"
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="verify-email"
          options={{ gestureEnabled: false }}
        />
      </Stack>
    </>
  );
}
