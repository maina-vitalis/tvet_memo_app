import { router } from "expo-router";
import { AlertCircle, MessageCircle } from "lucide-react-native";

import { Avatar, AvatarImage } from "@/src/shared/components/ui/avatar";
import { Badge, BadgeIcon, BadgeText } from "@/src/shared/components/ui/badge";
import { Box } from "@/src/shared/components/ui/box";
import { Card } from "@/src/shared/components/ui/card";
import { Heading } from "@/src/shared/components/ui/heading";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import type { MemoFeedItem, MemoTag } from "@/src/features/memos/types/MemoTypes";

function MemoTagBadge({ tag }: { tag: MemoTag }) {
  const toneClassName =
    tag.tone === "primary"
      ? "bg-accent"
      : tag.tone === "destructive"
        ? "bg-destructive/10"
        : "bg-muted";

  const textClassName =
    tag.tone === "primary"
      ? "text-primary"
      : tag.tone === "destructive"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Badge className={`rounded px-2 py-1 ${toneClassName}`}>
      {tag.showWarning ? (
        <BadgeIcon
          as={AlertCircle}
          size={16}
          className={`mr-1 ${textClassName}`}
        />
      ) : null}
      <BadgeText className={`normal-case ${textClassName}`}>
        {tag.label}
      </BadgeText>
    </Badge>
  );
}

export function MemoCard({ item }: { item: MemoFeedItem }) {
  return (
    <Pressable
      onPress={() => router.push(`/memo/${item.id}`)}
      className="active:scale-[0.99] data-[active=true]:opacity-95"
    >
      <Card
        size="sm"
        className={`relative gap-0 rounded-lg border-0 shadow-sm ${
          item.unread ? "border-l-4 border-l-secondary" : ""
        }`}
      >
        {item.unread ? (
          <Box className="absolute top-4 right-4 h-2 w-2 rounded-full bg-secondary" />
        ) : null}

        <HStack className="mb-3 items-start gap-2">
          {item.avatarUri ? (
            <Avatar className="h-10 w-10">
              <AvatarImage source={{ uri: item.avatarUri }} />
            </Avatar>
          ) : (
            <Box className="h-10 w-10 items-center justify-center rounded-full bg-muted">
              <MessageCircle className="h-4.5 w-4.5 text-muted-foreground" />
            </Box>
          )}

          <VStack className="flex-1">
            <Text className="text-sm font-bold text-foreground">
              {item.author}
            </Text>
            <Text className="text-xs text-muted-foreground">{item.meta}</Text>
          </VStack>
        </HStack>

        {item.titleEmphasis === "headline" ? (
          <Heading size="md" className="mb-2 pr-6 font-semibold text-primary">
            {item.title}
          </Heading>
        ) : (
          <Text className="mb-2 text-sm font-semibold text-foreground">
            {item.title}
          </Text>
        )}

        <Text className="mb-3 text-sm text-muted-foreground" numberOfLines={2}>
          {item.excerpt}
        </Text>

        <HStack className="flex-wrap gap-1">
          {item.tags.map((tag) => (
            <MemoTagBadge key={tag.label} tag={tag} />
          ))}
        </HStack>
      </Card>
    </Pressable>
  );
}
