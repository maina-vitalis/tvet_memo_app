import { Redirect } from "expo-router";

import { useAuth } from "@/src/lib/auth-context";

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/feed" />;
  }

  return <Redirect href="/(auth)/tenant-discovery" />;
}
