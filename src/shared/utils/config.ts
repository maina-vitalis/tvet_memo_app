import Constants from "expo-constants";
import { Platform } from "react-native";

function getDefaultApiUrl() {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000/api/v1";
  }

  return "http://localhost:5000/api/v1";
}

function resolveApiUrl(rawUrl: string | undefined) {
  const fallback = getDefaultApiUrl();
  const base = rawUrl?.replace(/\/$/, "") ?? fallback;

  // localhost inside .env does not reach the host machine on Android emulators.
  if (Platform.OS === "android" && base.includes("localhost")) {
    return base.replace("localhost", "10.0.2.2");
  }

  if (Platform.OS === "android" && base.includes("127.0.0.1")) {
    return base.replace("127.0.0.1", "10.0.2.2");
  }

  return base;
}

const configuredUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string | undefined);

export const API_BASE_URL = resolveApiUrl(configuredUrl);
