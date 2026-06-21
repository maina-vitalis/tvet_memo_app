import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tenant-discovery" />
      <Stack.Screen name="login-registry" />
    </Stack>
  );
}
