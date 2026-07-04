import { Bookmark } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/src/shared/components/ui/box";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import { ScreenHeader } from "@/src/shared/components/screen-header";

export default function BookmarksScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Box className="flex-1 bg-background">
        <ScreenHeader
          title="Bookmarks"
          subtitle="Memos you've saved for later."
        />

        <Box className="flex-1 items-center justify-center px-6">
          <VStack className="items-center gap-3">
            <Box className="rounded-full bg-muted p-4">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </Box>
            <Text className="text-center text-base font-semibold text-foreground">
              No bookmarks yet
            </Text>
            <Text className="text-center text-sm text-muted-foreground">
              Open memos from your feed. Bookmarking will be available in a
              future update.
            </Text>
          </VStack>
        </Box>
      </Box>
    </SafeAreaView>
  );
}