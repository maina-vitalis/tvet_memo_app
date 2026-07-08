import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import {
  deactivatePushToken,
  registerPushToken,
} from "@/src/features/notifications/api/pushTokenApi";
import { notificationsKeys } from "@/src/features/notifications/hooks/useNotifications";
import { incrementUnread } from "@/src/features/notifications/store/notificationsSlice";
import { selectIsAuthenticated } from "@/src/features/auth/store/authSelectors";
import { queryClient } from "@/src/shared/store/queryClient";
import { useAppDispatch, useAppSelector } from "@/src/shared/store/hooks";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("memos", {
    name: "Memo notifications",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#1a365d",
  });
}

async function resolveExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn("[Push] Missing EAS projectId — cannot register push token.");
    return null;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenResponse.data;
}

function resolveDeviceId(): string {
  return (
    Constants.installationId ??
    Device.osBuildId ??
    `${Platform.OS}-${Device.modelName ?? "unknown"}`
  );
}

export function usePushNotifications(): void {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const registeredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;

    const registerCurrentDevice = async () => {
      try {
        await ensureAndroidChannel();

        const token = await resolveExpoPushToken();

        if (!isMounted || !token || token === registeredTokenRef.current) {
          return;
        }

        await registerPushToken({
          token,
          deviceId: resolveDeviceId(),
          deviceName: Device.deviceName ?? Device.modelName ?? undefined,
        });

        registeredTokenRef.current = token;
      } catch (error) {
        console.warn("[Push] Failed to register push token", error);
      }
    };

    void registerCurrentDevice();

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      () => {
        dispatch(incrementUnread());
        void queryClient.invalidateQueries({
          queryKey: notificationsKeys.list(),
        });
      },
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const memoId = response.notification.request.content.data?.memoId;

        if (typeof memoId === "string" && memoId.length > 0) {
          router.push(`/memo/${memoId}`);
        }
      });

    return () => {
      isMounted = false;
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [dispatch, isAuthenticated]);
}

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
