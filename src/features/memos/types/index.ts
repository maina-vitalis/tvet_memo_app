export type { Memo } from "./MemoTypes";

export type MemoPriority = "urgent" | "normal";

export type MemoStatus =
  | "draft"
  | "scheduled"
  | "sent"
  | "archived"
  | "cancelled";

export interface MemoRecord {
  id: string;
  institutionId: string;
  senderId: string;
  subject: string;
  body: string;
  priority: MemoPriority;
  category: string;
  status: MemoStatus;
  requiresAck: boolean;
  ackDeadlineAt: string | null;
  scheduledAt: string | null;
  expiresAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  readAt?: string | null;
  acknowledgedAt?: string | null;
  bookmarked?: boolean;
}