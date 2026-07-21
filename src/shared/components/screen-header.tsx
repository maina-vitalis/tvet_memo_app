import { Box } from "@/src/shared/components/ui/box";
import { Heading } from "@/src/shared/components/ui/heading";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <Box className="border-b border-border bg-card px-4 py-3 shadow-sm">
      <HStack className="items-center justify-between">
        <VStack className="min-w-0 flex-1 pr-4">
          <Heading size="md" className="font-bold text-primary">
            {title}
          </Heading>
          {subtitle ? (
            <Text className="mt-0.5 text-sm text-muted-foreground">
              {subtitle}
            </Text>
          ) : null}
        </VStack>
      </HStack>
    </Box>
  );
}
