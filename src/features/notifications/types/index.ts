export type NotificationChannel = "push" | "email" | "sms";

export type NotificationDeliveryStatus =
  | "pending"
  | "sent"
  | "failed"
  | "skipped";

export interface Notification {
  id: string;
  institutionId: string;
  userId: string;
  memoId: string;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  retryCount: number;
  errorMessage: string | null;
  scheduledAt: string;
  sentAt: string | null;
  createdAt: string;
  read: boolean;
  title: string;
  message: string;
}
