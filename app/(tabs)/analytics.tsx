import { Box } from "@/src/components/ui/box";
import { Heading } from "@/src/components/ui/heading";
import { Text } from "@/src/components/ui/text";
import { VStack } from "@/src/components/ui/vstack";

export default function AnalyticsScreen() {
  return (
    <Box className="flex-1 items-center justify-center bg-background px-6">
      <VStack className="items-center gap-2">
        <Heading size="lg" className="text-primary">
          Analytics
        </Heading>
        <Text className="text-center text-muted-foreground">
          Analytics insights will appear here.
        </Text>
      </VStack>
    </Box>
  );
}
