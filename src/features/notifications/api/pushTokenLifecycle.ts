import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { deactivatePushToken } from "@/src/features/notifications/api/pushTokenApi";

export async function unregisterPushTokenOnLogout(): Promise<void> {
  try {
    if (!Device.isDevice) {
      return;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      return;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    await deactivatePushToken(tokenResponse.data);
  } catch (error) {
    console.warn("[Push] Failed to deactivate push token on logout", error);
  }
}
