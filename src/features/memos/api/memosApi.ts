import type { LocalMemoAttachment } from "@/src/features/memos/components/MemoAttachmentPicker";
import type { Memo } from "@/src/features/memos/types";
import type {
  CreateMemoPayload,
  CreatedMemo,
} from "@/src/features/memos/types/CreateMemoTypes";
import type { MemoAttachmentItem } from "@/src/features/memos/types/MemoTypes";
import type { PaginatedResponse } from "@/src/shared/types";
import {
  appendLocalFileToFormData,
  authenticatedMultipartRequest,
} from "@/src/shared/utils/multipartUpload";
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

type BackendAttachment = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  uploadedAt?: string;
};

type BackendMemo = {
  id: string;
  subject: string;
  body: string;
  bodyFormat?: "plain" | "html";
  sentAt: string | null;
  createdAt: string;
  attachments?: BackendAttachment[];
};

type InboxRecipient = {
  readAt: string | null;
};

type InboxRow = {
  memo: BackendMemo;
  recipient: InboxRecipient;
};

function mapAttachment(row: BackendAttachment): MemoAttachmentItem {
  return {
    id: row.id,
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    url: row.url,
    uploadedAt: row.uploadedAt,
  };
}

function mapMemo(row: BackendMemo, isRead = false): Memo {
  const publishedAt = row.sentAt ?? row.createdAt;

  return {
    id: row.id,
    title: row.subject,
    body: row.body,
    bodyFormat: row.bodyFormat ?? "plain",
    attachments: row.attachments?.map(mapAttachment),
    publishedAt,
    isRead,
  };
}

function mapInboxRow(row: InboxRow): Memo {
  return mapMemo(row.memo, Boolean(row.recipient.readAt));
}

let inboxCache: Memo[] | null = null;

function sortMemosNewestFirst(memos: Memo[]): Memo[] {
  return [...memos].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

async function fetchInboxMemos(): Promise<Memo[]> {
  const { data } = await apiClient.get<InboxRow[]>("/memos/inbox");
  inboxCache = sortMemosNewestFirst(data.map(mapInboxRow));
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

  const { data } = await apiClient.get<BackendMemo>(`/memos/${id}`);
  return mapMemo(data);
}

export async function markMemoRead(id: string): Promise<void> {
  assertMemoId(id);
  await apiClient.post(`/memos/${id}/read`);
}

export async function createMemo(
  payload: CreateMemoPayload,
): Promise<CreatedMemo> {
  const { data } = await apiClient.post<CreatedMemo>("/memos", payload);

  return data;
}

export type PublishMemoResponse = {
  memo: CreatedMemo;
  recipientCount: number;
};

/** Create and send in one request — used when there are no attachments. */
export async function publishMemo(
  payload: CreateMemoPayload,
): Promise<PublishMemoResponse> {
  const { data } = await apiClient.post<PublishMemoResponse>(
    "/memos/publish",
    payload,
  );

  clearMemosCache();

  return data;
}

/** Create, attach files, and send in one multipart request. */
export async function publishMemoWithAttachments(
  payload: CreateMemoPayload,
  files: LocalMemoAttachment[],
): Promise<PublishMemoResponse> {
  const formData = new FormData();
  formData.append("memo", JSON.stringify(payload));

  for (const file of files) {
    await appendLocalFileToFormData(formData, "files", file);
  }

  const result = await authenticatedMultipartRequest<PublishMemoResponse>(
    "/memos/publish-with-attachments",
    {
      method: "POST",
      formData,
      fallbackError: "Could not publish this memo.",
    },
  );

  clearMemosCache();

  return result;
}

export async function sendMemo(id: string): Promise<PublishMemoResponse> {
  assertMemoId(id);

  const { data } = await apiClient.post<PublishMemoResponse>(
    `/memos/${id}/send`,
  );

  clearMemosCache();

  return data;
}
