import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { clearMemosCache } from "@/src/features/memos/api/memosApi";
import { memosKeys } from "@/src/features/memos/hooks/useMemos";
import { registerPushToken } from "@/src/features/notifications/api/pushTokenApi";
import { notificationsKeys } from "@/src/features/notifications/queryKeys";
import { incrementUnread } from "@/src/features/notifications/store/notificationsSlice";
import { useAppDispatch, useAppSelector } from "@/src/shared/store/hooks";
import { queryClient } from "@/src/shared/store/queryClient";

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

  //checks the existing permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  //if not granted request for permission again
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

const PUSH_DEVICE_ID_KEY = "memo_push_device_id";

async function resolveDeviceId(): Promise<string> {
  const storedDeviceId = await AsyncStorage.getItem(PUSH_DEVICE_ID_KEY);
  if (storedDeviceId) {
    return storedDeviceId;
  }

  const deviceId =
    Constants.installationId ??
    Device.osBuildId ??
    `${Platform.OS}-${Device.modelName ?? "unknown"}`;

  await AsyncStorage.setItem(PUSH_DEVICE_ID_KEY, deviceId);
  return deviceId;
}

export function usePushNotifications(): void {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.token));
  const registeredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;

    const registerCurrentDevice = async () => {
      try {
        await ensureAndroidChannel(); //for adroid a channel is required to send the memos

        const token = await resolveExpoPushToken(); //generates  the expo push token needed to push the notifications

        if (!isMounted || !token || token === registeredTokenRef.current) {
          return;
        }

        await registerPushToken({
          token,
          deviceId: await resolveDeviceId(),
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
        clearMemosCache();
        void queryClient.invalidateQueries({
          queryKey: memosKeys.lists(),
        });
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
