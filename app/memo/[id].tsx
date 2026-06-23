import { Badge, BadgeIcon, BadgeText } from "@/src/components/ui/badge";
import { Box } from "@/src/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Heading } from "@/src/components/ui/heading";
import { HStack } from "@/src/components/ui/hstack";
import { Pressable } from "@/src/components/ui/pressable";
import { ScrollView } from "@/src/components/ui/scroll-view";
import { Text } from "@/src/components/ui/text";
import { VStack } from "@/src/components/ui/vstack";
import { getMemoDetail, type MemoBodyBlock } from "@/src/lib/memo-data";
import { router, useLocalSearchParams } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  FileText,
  User,
} from "lucide-react-native";
import { useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

function MemoBody({ blocks }: { blocks: MemoBodyBlock[] }) {
  return (
    <VStack className="gap-4">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <Text key={index} className="text-base leading-6 text-foreground">
              {block.text}
            </Text>
          );
        }

        if (block.type === "list") {
          return (
            <VStack key={index} className="gap-2 pl-4">
              {block.items.map((item, itemIndex) => (
                <HStack key={itemIndex} className="items-start gap-2">
                  <Text className="text-base text-muted-foreground">•</Text>
                  <Text className="flex-1 text-base leading-6 text-muted-foreground">
                    {item}
                  </Text>
                </HStack>
              ))}
            </VStack>
          );
        }

        return (
          <VStack key={index} className="gap-1">
            {block.lines.map((line, lineIndex) => (
              <Text
                key={lineIndex}
                className={`text-base leading-6 text-foreground ${
                  lineIndex === block.lines.length - 1 ? "font-semibold" : ""
                }`}
              >
                {line}
              </Text>
            ))}
          </VStack>
        );
      })}
    </VStack>
  );
}

function AttachmentCard({
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

export default function MemoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const memo = getMemoDetail(id ?? "");
  const [acknowledged, setAcknowledged] = useState(false);

  if (!memo) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
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

  const authorLabel = memo.authorRole
    ? `${memo.author}, ${memo.authorRole}`
    : memo.author;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
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
              <User className="h-4 w-4 text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">
                {authorLabel}
              </Text>
              <Text className="text-muted-foreground">•</Text>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">
                {memo.publishedAt}
              </Text>

              {memo.priority === "urgent" ? (
                <Badge className="ml-auto rounded-full bg-destructive/10 px-2 py-1">
                  <BadgeIcon
                    as={AlertTriangle}
                    size={14}
                    className="mr-1 text-destructive"
                  />
                  <BadgeText className="normal-case text-destructive">
                    Urgent
                  </BadgeText>
                </Badge>
              ) : null}
            </HStack>

            <MemoBody blocks={memo.body} />
          </Card>

          {memo.attachments.length > 0 ? (
            <VStack className="gap-2">
              <Text className="px-1 text-sm font-semibold text-muted-foreground">
                Attachments
              </Text>
              {memo.attachments.map((attachment) => (
                <AttachmentCard
                  key={attachment.id}
                  fileName={attachment.fileName}
                  sizeLabel={attachment.sizeLabel}
                  category={attachment.category}
                />
              ))}
            </VStack>
          ) : null}
        </ScrollView>

        {memo.requiresAcknowledgement ? (
          <Box
            className="absolute bottom-0 left-0 right-0 border-t border-border/20 bg-card shadow-sm"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <VStack className="mx-auto w-full max-w-3xl items-center justify-between gap-4 px-4 pt-4">
              <Text className="hidden flex-1 text-[11px] text-muted-foreground sm:flex">
                Acknowledge receipt to clear this alert from your dashboard.
              </Text>

              <Button
                variant="secondary"
                size="lg"
                disabled={acknowledged}
                onPress={() => setAcknowledged(true)}
                className="min-h-11 flex-1 rounded-lg shadow-md sm:flex-none"
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
