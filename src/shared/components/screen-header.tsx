import type { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";

import { Box } from "@/src/shared/components/ui/box";
import { Heading } from "@/src/shared/components/ui/heading";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  variant?: "gradient" | "plain";
};

export function ScreenHeader({
  title,
  subtitle,
  rightAction,
  variant = "gradient",
}: ScreenHeaderProps) {
  if (variant === "plain") {
    return (
      <Box className="border-b border-border/80 bg-card px-4 py-4 shadow-sm">
        <HStack className="items-center justify-between">
          <HeaderText title={title} subtitle={subtitle} light={false} />
          {rightAction}
        </HStack>
      </Box>
    );
  }

  return (
    <Box className="overflow-hidden shadow-sm">
      <LinearGradient
        colors={["#234698", "#1B3A7C", "#234698"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 }}
      >
        <HStack className="items-start justify-between">
          <HeaderText title={title} subtitle={subtitle} light />
          {rightAction}
        </HStack>
      </LinearGradient>
      <Box className="h-1 bg-secondary/90" />
    </Box>
  );
}

function HeaderText({
  title,
  subtitle,
  light,
}: {
  title: string;
  subtitle?: string;
  light: boolean;
}) {
  return (
    <VStack className="min-w-0 flex-1 pr-4">
      <Heading
        size="md"
        className={`font-bold ${light ? "text-primary-foreground" : "text-primary"}`}
      >
        {title}
      </Heading>
      {subtitle ? (
        <Text
          className={`mt-0.5 text-sm ${light ? "text-primary-foreground/80" : "text-muted-foreground"}`}
        >
          {subtitle}
        </Text>
      ) : null}
    </VStack>
  );
}
