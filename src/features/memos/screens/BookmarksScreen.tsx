import { Box } from "@/src/shared/components/ui/box";
import { ScrollView } from "@/src/shared/components/ui/scroll-view";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import { ScreenHeader } from "@/src/shared/components/screen-header";
import { MemoCard } from "@/src/features/memos/components/MemoCard";
import { getBookmarkedFeedItems } from "@/src/features/memos/types/MemoTypes";
import { Bookmark } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookmarksScreen() {
  const bookmarkedItems = getBookmarkedFeedItems();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Box className="flex-1 bg-background">
        <ScreenHeader
          title="Bookmarks"
          subtitle="Memos you've saved for later."
        />

        {bookmarkedItems.length > 0 ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-4 px-4 pb-6 pt-4"
            showsVerticalScrollIndicator={false}
          >
            {bookmarkedItems.map((item) => (
              <MemoCard key={item.id} item={item} />
            ))}
          </ScrollView>
        ) : (
          <Box className="flex-1 items-center justify-center px-6">
            <VStack className="items-center gap-3">
              <Box className="rounded-full bg-muted p-4">
                <Bookmark className="h-8 w-8 text-muted-foreground" />
              </Box>
              <Text className="text-center text-base font-semibold text-foreground">
                No bookmarks yet
              </Text>
              <Text className="text-center text-sm text-muted-foreground">
                Save memos from the feed to find them here later.
              </Text>
            </VStack>
          </Box>
        )}
      </Box>
    </SafeAreaView>
  );
}
