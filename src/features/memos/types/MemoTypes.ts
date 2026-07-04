export interface Memo {
  id: string;
  title: string;
  body: string;
  attachmentUrl?: string;
  publishedAt: string;
  isAcknowledged: boolean;
}

export type MemoTag = {
  label: string;
  tone: "primary" | "destructive" | "muted";
  showWarning?: boolean;
};

export type MemoBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "signature"; lines: string[] };

export type MemoAttachment = {
  id: string;
  fileName: string;
  sizeLabel: string;
  category: string;
};

export type MemoDetail = {
  id: string;
  title: string;
  author: string;
  authorRole?: string;
  publishedAt: string;
  priority?: "urgent" | "normal";
  body: MemoBodyBlock[];
  attachments: MemoAttachment[];
  requiresAcknowledgement?: boolean;
};

export type MemoFeedItem = {
  id: string;
  author: string;
  meta: string;
  title: string;
  excerpt: string;
  tags: MemoTag[];
  avatarUri?: string;
  avatarFallbackIcon?: "campaign";
  unread?: boolean;
  acknowledged?: boolean;
  bookmarked?: boolean;
  titleEmphasis?: "headline" | "label";
};