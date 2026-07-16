export type { Memo } from "./MemoTypes";

export type MemoPriority = "urgent" | "normal";

export type MemoStatus = "draft" | "sent" | "archived" | "cancelled";

export interface MemoRecord {
  id: string;
  institutionId: string;
  senderId: string;
  subject: string;
  body: string;
  priority: MemoPriority;
  category: string;
  status: MemoStatus;
  expiresAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  readAt?: string | null;
  bookmarked?: boolean;
}
