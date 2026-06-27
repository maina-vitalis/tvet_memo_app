import type { Notification } from "@/src/features/notifications/types";
import { getStore } from "@/src/shared/store/storeRef";
import apiClient from "@/src/shared/utils/apiClient";

type InboxRow = {
  memo: {
    id: string;
    subject: string;
    body: string;
    sentAt: string | null;
    createdAt: string;
  };
  recipient: {
    readAt: string | null;
    acknowledgedAt: string | null;
  };
};

function mapInboxToNotification(
  row: InboxRow,
  institutionId: string,
  userId: string,
): Notification {
  const publishedAt = row.memo.sentAt ?? row.memo.createdAt;

  return {
    id: row.memo.id,
    institutionId,
    userId,
    memoId: row.memo.id,
    channel: "push",
    status: "sent",
    retryCount: 0,
    errorMessage: null,
    scheduledAt: publishedAt,
    sentAt: publishedAt,
    createdAt: publishedAt,
    read: Boolean(row.recipient.readAt),
    title: row.memo.subject,
    message: row.memo.body.slice(0, 160),
  };
}

export async function getNotifications(): Promise<Notification[]> {
  const { user, institution } = getStore().getState().auth;
  const { data } = await apiClient.get<InboxRow[]>("/memos/inbox");

  return data.map((row) =>
    mapInboxToNotification(
      row,
      institution?.id ?? user?.institutionId ?? "",
      user?.id ?? "",
    ),
  );
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.post(`/memos/${id}/read`);
}