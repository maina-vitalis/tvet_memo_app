import { usePushNotifications } from "@/src/features/notifications/hooks/usePushNotifications";

export function PushNotificationBootstrap() {
  usePushNotifications();
  return null;
}
