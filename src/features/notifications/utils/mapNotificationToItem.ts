import { BellRing } from "lucide-react-native";

import type { NotificationItemData } from "@/src/features/notifications/components/NotificationItem";
import type { Notification } from "@/src/features/notifications/types";

export function mapNotificationToItem(
  notification: Notification,
): NotificationItemData {
  const sentDate = new Date(notification.sentAt ?? notification.createdAt);

  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    time: Number.isNaN(sentDate.getTime())
      ? "Recently"
      : sentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    icon: BellRing,
    iconTone: notification.read ? "muted" : "primary",
    unread: !notification.read,
  };
}