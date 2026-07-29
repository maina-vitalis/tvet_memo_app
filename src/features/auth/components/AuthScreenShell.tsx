import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";

import { Box } from "@/src/shared/components/ui/box";
import { Heading } from "@/src/shared/components/ui/heading";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";

type AuthScreenShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  institutionName?: string;
  onBack?: () => void;
  header?: ReactNode;
  contentClassName?: string;
};

export function AuthScreenBackdrop() {
  return <Box className="absolute inset-0 bg-background" />;
}

export function AuthFormCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Box
      className={`overflow-hidden rounded-2xl border border-border/70 border-t-2 border-t-primary bg-card shadow-sm ${className ?? ""}`}
    >
      <Box className="p-6">{children}</Box>
    </Box>
  );
}

export function AuthScreenShell({
  children,
  title,
  subtitle,
  institutionName,
  onBack,
  header,
  contentClassName,
}: AuthScreenShellProps) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 bg-background">
        <AuthScreenBackdrop />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <VStack
            className={`z-10 flex-1 px-4 pb-8 pt-2 md:px-6 ${contentClassName ?? ""}`}
          >
            {onBack ? (
              <Pressable
                onPress={onBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                className="mb-2 h-10 w-10 items-center justify-center rounded-xl bg-card shadow-sm data-[active=true]:bg-muted"
              >
                <ChevronLeft className="h-6 w-6 text-primary" />
              </Pressable>
            ) : null}

            {header}

            {title ? (
              <VStack className="mb-6 gap-1.5">
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
                {institutionName ? (
                  <Text className="text-sm font-medium text-primary">
                    {institutionName}
                  </Text>
                ) : null}
                <Box className="mt-2 h-0.5 w-9 rounded-full bg-primary" />
              </VStack>
            ) : null}

            {children}
          </VStack>
        </KeyboardAvoidingView>
      </Box>
    </SafeAreaView>
  );
}

export function AuthBrandHeader({
  logo,
  brandName = "TVET MEMO",
}: {
  logo: ReactNode;
  brandName?: string;
}) {
  return (
    <VStack className="mb-6 items-center">
      {logo}
      <Text className="mt-3 text-lg font-bold text-primary">{brandName}</Text>
    </VStack>
  );
}
