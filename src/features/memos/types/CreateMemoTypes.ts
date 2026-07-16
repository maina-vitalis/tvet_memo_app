export type MemoPriority = "low" | "normal" | "high" | "urgent";

export type MemoCategory =
  | "general"
  | "academic"
  | "administrative"
  | "emergency"
  | "event";

export type MemoTargetType =
  | "broadcast"
  | "department"
  | "role"
  | "individual";

export type CreateMemoPayload = {
  subject: string;
  body: string;
  category: MemoCategory;
  targetType: MemoTargetType;
  priority?: MemoPriority;
  targetPayload?: Record<string, unknown>;
  expiresAt?: string;
};

export type CreatedMemo = {
  id: string;
  institutionId: string;
  senderId: string;
  subject: string;
  body: string;
  priority: MemoPriority;
  category: MemoCategory;
  status: "draft" | "sent" | "archived" | "cancelled";
  targetType: MemoTargetType;
  targetPayload: Record<string, unknown>;
  expiresAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};
