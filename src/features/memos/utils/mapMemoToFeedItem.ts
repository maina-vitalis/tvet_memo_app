import type { Memo } from "@/src/features/memos/types";
import type { MemoFeedItem } from "@/src/features/memos/types/MemoTypes";
import { memoExcerpt } from "@/src/features/memos/utils/memoContent";

export function mapMemoToFeedItem(memo: Memo): MemoFeedItem {
  const publishedDate = new Date(memo.publishedAt);

  return {
    id: memo.id,
    author: "Institution",
    meta: Number.isNaN(publishedDate.getTime())
      ? memo.publishedAt
      : publishedDate.toLocaleDateString(),
    title: memo.title,
    excerpt: memoExcerpt(memo.body, memo.bodyFormat),
    tags: memo.isRead ? [] : [{ label: "New", tone: "primary" }],
    unread: !memo.isRead,
    titleEmphasis: "label",
  };
}
