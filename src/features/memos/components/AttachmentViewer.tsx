import { Download, FileText } from "lucide-react-native";

import { Box } from "@/src/shared/components/ui/box";
import { Card } from "@/src/shared/components/ui/card";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";

export function AttachmentViewer({
  fileName,
  sizeLabel,
  category,
}: {
  fileName: string;
  sizeLabel: string;
  category: string;
}) {
  return (
    <Pressable className="active:scale-[0.99] data-[active=true]:opacity-95">
      <Card
        size="sm"
        className="flex-row items-center justify-between gap-3 rounded-lg border border-border/50 bg-accent p-4 shadow-none"
      >
        <HStack className="min-w-0 flex-1 items-center gap-4">
          <Box className="rounded-lg bg-destructive/10 p-2">
            <FileText className="h-7 w-7 text-destructive" />
          </Box>
          <VStack className="min-w-0 flex-1">
            <Text className="text-sm font-semibold text-foreground">
              {fileName}
            </Text>
            <Text className="text-[11px] text-muted-foreground">
              {sizeLabel} • {category}
            </Text>
          </VStack>
        </HStack>

        <Pressable
          accessibilityLabel="Download attachment"
          className="rounded-full p-2 data-[active=true]:bg-muted"
        >
          <Download className="h-5 w-5 text-primary" />
        </Pressable>
      </Card>
    </Pressable>
  );
}
