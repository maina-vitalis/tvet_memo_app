import type { Memo } from "@/src/features/memos/types";
import type {
  CreateMemoPayload,
  CreatedMemo,
} from "@/src/features/memos/types/CreateMemoTypes";
import type { PaginatedResponse } from "@/src/shared/types";
import apiClient from "@/src/shared/utils/apiClient";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidMemoId(id: string): boolean {
  return UUID_RE.test(id);
}

function assertMemoId(id: string): void {
  if (!isValidMemoId(id)) {
    throw new Error("Invalid memo id");
  }
}

type BackendMemo = {
  id: string;
  subject: string;
  body: string;
  sentAt: string | null;
  createdAt: string;
  requiresAck: boolean;
};

type InboxRecipient = {
  acknowledgedAt: string | null;
  readAt: string | null;
};

type InboxRow = {
  memo: BackendMemo;
  recipient: InboxRecipient;
};

function mapInboxRow(row: InboxRow): Memo {
  const publishedAt = row.memo.sentAt ?? row.memo.createdAt;

  return {
    id: row.memo.id,
    title: row.memo.subject,
    body: row.memo.body,
    publishedAt,
    isAcknowledged: Boolean(row.recipient.acknowledgedAt),
  };
}

let inboxCache: Memo[] | null = null;

async function fetchInboxMemos(): Promise<Memo[]> {
  if (inboxCache) {
    return inboxCache;
  }

  const { data } = await apiClient.get<InboxRow[]>("/memos/inbox");
  inboxCache = data.map(mapInboxRow);
  return inboxCache;
}

export function clearMemosCache() {
  inboxCache = null;
}

export async function getMemos(
  page: number,
  limit: number,
): Promise<PaginatedResponse<Memo>> {
  const allMemos = await fetchInboxMemos();
  const start = (page - 1) * limit;
  const data = allMemos.slice(start, start + limit);

  return {
    data,
    total: allMemos.length,
    page,
    limit,
  };
}

export async function getMemoById(id: string): Promise<Memo> {
  assertMemoId(id);

  const cached = inboxCache?.find((memo) => memo.id === id);
  if (cached) {
    return cached;
  }

  const { data } = await apiClient.get<BackendMemo>(`/memos/${id}`);

  return {
    id: data.id,
    title: data.subject,
    body: data.body,
    publishedAt: data.sentAt ?? data.createdAt,
    isAcknowledged: false,
  };
}

export async function acknowledgeMemo(
  id: string,
): Promise<{ acknowledgedAt: string }> {
  assertMemoId(id);

  const { data } = await apiClient.post<InboxRecipient>(
    `/memos/${id}/acknowledge`,
    { ackType: "simple" },
  );

  if (inboxCache) {
    inboxCache = inboxCache.map((memo) =>
      memo.id === id ? { ...memo, isAcknowledged: true } : memo,
    );
  }

  return {
    acknowledgedAt: data.acknowledgedAt ?? new Date().toISOString(),
  };
}

export async function createMemo(payload: CreateMemoPayload): Promise<CreatedMemo> {
  const { data } = await apiClient.post<CreatedMemo>("/memos", payload);

  return data;
}

export async function sendMemo(id: string): Promise<CreatedMemo> {
  assertMemoId(id);

  const { data } = await apiClient.post<CreatedMemo>(`/memos/${id}/send`);

  clearMemosCache();

  return data;
}