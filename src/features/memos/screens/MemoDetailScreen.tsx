import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock } from "lucide-react-native";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { markMemoRead } from "@/src/features/memos/api/memosApi";
import { MemoAttachmentsList } from "@/src/features/memos/components/MemoAttachmentsList";
import { MemoBodyContent } from "@/src/features/memos/components/MemoBodyContent";
import { useMemoDetail } from "@/src/features/memos/hooks/useMemos";
import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonText } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Heading } from "@/src/shared/components/ui/heading";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { ScrollView } from "@/src/shared/components/ui/scroll-view";
import { ScreenStatusBar } from "@/src/shared/components/screen-status-bar";
import { Text } from "@/src/shared/components/ui/text";

export default function MemoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const memoId = id ?? "";

  const { data: memo, isLoading, isError } = useMemoDetail(memoId);

  useEffect(() => {
    if (!memoId || !memo) {
      return;
    }

    void markMemoRead(memoId).catch(() => {});
  }, [memo, memoId]);

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
          contentContainerClassName="mx-auto w-full max-w-3xl gap-6 px-4 pb-8 pt-4 md:px-6"
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
            </HStack>

            <MemoBodyContent body={memo.body} bodyFormat={memo.bodyFormat} />

            <MemoAttachmentsList attachments={memo.attachments ?? []} />
          </Card>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
