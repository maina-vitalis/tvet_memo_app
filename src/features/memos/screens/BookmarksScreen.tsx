import { Bookmark } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/src/shared/components/ui/box";
import { Card } from "@/src/shared/components/ui/card";
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
          <Card className="w-full max-w-sm items-center gap-4 border-border/70 p-8 shadow-sm">
            <Box className="rounded-2xl bg-accent p-4">
              <Bookmark className="h-8 w-8 text-primary" />
            </Box>
            <VStack className="items-center gap-2">
              <Text className="text-center text-base font-semibold text-foreground">
                No bookmarks yet
              </Text>
              <Text className="text-center text-sm leading-5 text-muted-foreground">
                Open memos from your feed. Bookmarking will be available in a
                future update.
              </Text>
            </VStack>
          </Card>
        </Box>
      </Box>
    </SafeAreaView>
  );
}
