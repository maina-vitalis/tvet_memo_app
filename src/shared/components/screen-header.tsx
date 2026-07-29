import type { ReactNode } from "react";

import { Box } from "@/src/shared/components/ui/box";
import { Heading } from "@/src/shared/components/ui/heading";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";

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
    <Box className="border-b border-border/60 bg-card px-5 pb-5 pt-1">
      <HStack className="items-start justify-between gap-3">
        <VStack className="min-w-0 flex-1 gap-1.5">
          <Heading
            size="2xl"
            className="font-semibold tracking-tight text-foreground"
          >
            {title}
          </Heading>
          {subtitle ? (
            <Text className="text-sm leading-5 text-muted-foreground">
              {subtitle}
            </Text>
          ) : null}
          <Box className="mt-2 h-0.5 w-9 rounded-full bg-primary" />
        </VStack>
        {rightAction}
      </HStack>
    </Box>
  );
}
