import type { ReactNode } from "react";

import { Box } from "@/src/components/ui/box";
import { Heading } from "@/src/components/ui/heading";
import { HStack } from "@/src/components/ui/hstack";
import { Text } from "@/src/components/ui/text";
import { VStack } from "@/src/components/ui/vstack";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
};

export function ScreenHeader({
  title,
  subtitle,
  rightAction,
}: ScreenHeaderProps) {
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
        {rightAction ?? <Box className="h-10 w-10" />}
      </HStack>
    </Box>
  );
}
