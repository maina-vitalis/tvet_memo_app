import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
} from "lucide-react-native";
import { ActivityIndicator } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { MemoDetail } from "@/src/features/memos/components/MemoDetail";
import {
  useAcknowledgeMemo,
  useMemoDetail,
} from "@/src/features/memos/hooks/useMemos";
import { Badge, BadgeIcon, BadgeText } from "@/src/shared/components/ui/badge";
import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Heading } from "@/src/shared/components/ui/heading";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { ScrollView } from "@/src/shared/components/ui/scroll-view";
import { ScreenStatusBar } from "@/src/shared/components/screen-status-bar";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";

export default function MemoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const memoId = id ?? "";

  const { data: memo, isLoading, isError } = useMemoDetail(memoId);
  const acknowledgeMemo = useAcknowledgeMemo();

  const acknowledged =
    memo?.isAcknowledged ?? acknowledgeMemo.isSuccess;

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Box className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator />
        </Box>
      </SafeAreaView>
    );
  }

  if (isError || !memo) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenStatusBar style="dark" backgroundColor="#ffffff" />
        <Box className="flex-1 items-center justify-center bg-background px-6">
          <Text className="text-center text-muted-foreground">
            Memo not found.
          </Text>
          <Button
            variant="outline"
            className="mt-4"
            onPress={() => router.back()}
          >
            <ButtonText>Go back</ButtonText>
          </Button>
        </Box>
      </SafeAreaView>
    );
  }

  const publishedDate = new Date(memo.publishedAt);
  const publishedLabel = Number.isNaN(publishedDate.getTime())
    ? memo.publishedAt
    : publishedDate.toLocaleString();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScreenStatusBar style="dark" backgroundColor="#ffffff" />
      <Box className="flex-1 bg-background">
        <HStack className="items-center justify-between border-b border-border bg-card px-4 py-2 shadow-sm">
          <Pressable
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full data-[active=true]:bg-muted"
          >
            <ArrowLeft className="h-5 w-5 text-primary" />
          </Pressable>

          <Heading
            size="md"
            isTruncated
            className="flex-1 px-4 text-center font-bold text-primary"
          >
            Memo Details
          </Heading>

          <Box className="h-10 w-10" />
        </HStack>

        <ScrollView
          className="flex-1"
          contentContainerClassName="mx-auto w-full max-w-3xl gap-6 px-4 pb-32 pt-4 md:px-6"
          showsVerticalScrollIndicator={false}
        >
          <Card
            size="sm"
            className="gap-0 rounded-lg border border-border/30 bg-card p-4 shadow-sm"
          >
            <Heading
              size="lg"
              className="mb-2 font-bold leading-tight text-primary"
            >
              {memo.title}
            </Heading>

            <HStack className="mb-4 flex-wrap items-center gap-2 border-b border-border pb-4">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">
                {publishedLabel}
              </Text>

              {memo.isAcknowledged ? (
                <Badge className="ml-auto rounded-full bg-success/10 px-2 py-1">
                  <BadgeIcon
                    as={CheckCircle}
                    size={14}
                    className="mr-1 text-success"
                  />
                  <BadgeText className="normal-case text-success">
                    Acknowledged
                  </BadgeText>
                </Badge>
              ) : null}
            </HStack>

            <MemoDetail
              blocks={[{ type: "paragraph", text: memo.body }]}
            />
          </Card>
        </ScrollView>

        {!memo.isAcknowledged ? (
          <Box
            className="absolute bottom-0 left-0 right-0 border-t border-border/20 bg-card shadow-sm"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <VStack className="mx-auto w-full max-w-3xl items-center justify-between gap-4 px-4 pt-4">
              <Button
                variant="secondary"
                size="lg"
                disabled={acknowledged || acknowledgeMemo.isPending}
                onPress={() => acknowledgeMemo.mutate(memo.id)}
                className="min-h-11 w-full rounded-lg shadow-md"
              >
                <ButtonIcon
                  as={CheckCircle}
                  className="fill-secondary-foreground"
                />
                <ButtonText className="font-semibold">
                  {acknowledged ? "Acknowledged" : "Acknowledge Receipt"}
                </ButtonText>
              </Button>
            </VStack>
          </Box>
        ) : null}
      </Box>
    </SafeAreaView>
  );
}