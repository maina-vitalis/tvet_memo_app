import { ScrollView } from "@/src/shared/components/ui/scroll-view";
import type { MemoFeedItem } from "@/src/features/memos/types/MemoTypes";

import { MemoCard } from "./MemoCard";

export function MemoList({ items }: { items: MemoFeedItem[] }) {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-4 px-4 pb-6 pt-4"
      showsVerticalScrollIndicator={false}
    >
      {items.map((item) => (
        <MemoCard key={item.id} item={item} />
      ))}
    </ScrollView>
  );
}
