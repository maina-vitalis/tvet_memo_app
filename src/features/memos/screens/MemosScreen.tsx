import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GripVertical, Plus, RefreshCcw, Search } from "lucide-react-native";

import { MemoList } from "@/src/features/memos/components/MemoList";
import { useCanBroadcastMemo } from "@/src/features/memos/hooks/useMemoPermissions";
import { useMemosQuery } from "@/src/features/memos/hooks/useMemos";
import { MEMO_ROUTES } from "@/src/features/memos/navigation";
import { mapMemoToFeedItem } from "@/src/features/memos/utils/mapMemoToFeedItem";
import { Box } from "@/src/shared/components/ui/box";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Input, InputField, InputSlot } from "@/src/shared/components/ui/input";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { ScreenHeader } from "@/src/shared/components/screen-header";
import { Text } from "@/src/shared/components/ui/text";

export default function MemosScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const canBroadcastMemo = useCanBroadcastMemo();
  const { data, isLoading, isError, refetch, isRefetching } = useMemosQuery();

  const feedItems = useMemo(() => {
    const memos = data?.pages.flatMap((page) => page.data) ?? [];
    const items = memos.map(mapMemoToFeedItem);
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.excerpt.toLowerCase().includes(query),
    );
  }, [data, searchQuery]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Box className="flex-1">
        <ScreenHeader
          title="Feed"
          rightAction={
            <HStack className="items-center gap-1">
              {canBroadcastMemo ? (
                <Pressable
                  accessibilityLabel="Create memo"
                  onPress={() => router.push(MEMO_ROUTES.create)}
                  className="h-10 w-10 items-center justify-center rounded-full bg-primary data-[active=true]:bg-primary/90"
                >
                  <Plus
                    className="h-5 w-5 text-primary-foreground"
                    strokeWidth={2.5}
                  />
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => void refetch()}
                className="h-10 w-10 items-center justify-center rounded-full data-[active=true]:bg-muted"
              >
                <RefreshCcw
                  className={`h-5 w-5 text-muted-foreground ${
                    isRefetching ? "opacity-50" : ""
                  }`}
                />
              </Pressable>
            </HStack>
          }
        />

        <Box className="border-b border-border bg-background/95 px-4 py-4">
          <Input className="h-12 rounded-lg border-border bg-card shadow-sm">
            <InputSlot className="pl-3">
              <Search className="h-4.5 w-4.5 text-muted-foreground" />
            </InputSlot>
            <InputField
              placeholder="Search memos, courses..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search memos"
              className="px-2 text-sm text-foreground"
            />
            <InputSlot className="pr-2">
              <Pressable className="h-8 w-8 items-center justify-center rounded-md data-[active=true]:bg-muted">
                <GripVertical className="h-4.5 w-4.5 text-muted-foreground" />
              </Pressable>
            </InputSlot>
          </Input>
        </Box>

        {isLoading ? (
          <Box className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </Box>
        ) : isError ? (
          <Box className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-muted-foreground">
              Could not load memos. Pull to refresh or try again later.
            </Text>
          </Box>
        ) : feedItems.length === 0 ? (
          <Box className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-muted-foreground">
              No memos in your inbox yet.
            </Text>
          </Box>
        ) : (
          <MemoList items={feedItems} />
        )}
      </Box>
    </SafeAreaView>
  );
}