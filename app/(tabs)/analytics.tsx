import { Box } from "@/src/components/ui/box";
import { Text } from "@/src/components/ui/text";
import { VStack } from "@/src/components/ui/vstack";
import { ScreenHeader } from "@/src/components/screen-header";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 bg-background">
        <ScreenHeader title="Analytics" />

        <Box className="flex-1 items-center justify-center px-6">
          <VStack className="items-center gap-2">
            <Text className="text-center text-muted-foreground">
              Analytics insights will appear here.
            </Text>
          </VStack>
        </Box>
      </Box>
    </SafeAreaView>
  );
}
