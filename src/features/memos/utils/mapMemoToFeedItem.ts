import type { Memo } from "@/src/features/memos/types";
import type { MemoFeedItem } from "@/src/features/memos/types/MemoTypes";

export function mapMemoToFeedItem(memo: Memo): MemoFeedItem {
  const publishedDate = new Date(memo.publishedAt);

  return {
    id: memo.id,
    author: "Institution",
    meta: Number.isNaN(publishedDate.getTime())
      ? memo.publishedAt
      : publishedDate.toLocaleDateString(),
    title: memo.title,
    excerpt:
      memo.body.length > 140 ? `${memo.body.slice(0, 140)}…` : memo.body,
    tags: memo.isAcknowledged
      ? [{ label: "Acknowledged", tone: "muted" }]
      : [{ label: "New", tone: "primary" }],
    acknowledged: memo.isAcknowledged,
    unread: !memo.isAcknowledged,
    titleEmphasis: "label",
  };
}