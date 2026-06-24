import { Avatar, AvatarImage } from "@/src/components/ui/avatar";
import { Badge, BadgeIcon, BadgeText } from "@/src/components/ui/badge";
import { Box } from "@/src/components/ui/box";
import { Card } from "@/src/components/ui/card";
import { Heading } from "@/src/components/ui/heading";
import { HStack } from "@/src/components/ui/hstack";
import { Pressable } from "@/src/components/ui/pressable";
import { ScrollView } from "@/src/components/ui/scroll-view";
import { Text } from "@/src/components/ui/text";
import { VStack } from "@/src/components/ui/vstack";
import { ScreenHeader } from "@/src/components/screen-header";
import {
  getBookmarkedFeedItems,
  type MemoFeedItem,
  type MemoTag,
} from "@/src/lib/memo-data";
import { router } from "expo-router";
import {
  AlertCircle,
  Bookmark,
  CheckCircle,
  MessageCircle,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

function MemoCard({ item }: { item: MemoFeedItem }) {
  return (
    <Pressable
      onPress={() => router.push(`/memo/${item.id}`)}
      className="active:scale-[0.99] data-[active=true]:opacity-95"
    >
      <Card
        size="sm"
        className={`relative gap-0 rounded-lg border-0 shadow-sm ${
          item.unread ? "border-l-4 border-l-secondary" : ""
        } ${item.acknowledged ? "opacity-80" : ""}`}
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

          {item.acknowledged ? (
            <CheckCircle className="h-4.5 w-4.5 text-primary" />
          ) : null}
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

export default function BookmarksScreen() {
  const bookmarkedItems = getBookmarkedFeedItems();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Box className="flex-1 bg-background">
        <ScreenHeader
          title="Bookmarks"
          subtitle="Memos you've saved for later."
        />

        {bookmarkedItems.length > 0 ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-4 px-4 pb-6 pt-4"
            showsVerticalScrollIndicator={false}
          >
            {bookmarkedItems.map((item) => (
              <MemoCard key={item.id} item={item} />
            ))}
          </ScrollView>
        ) : (
          <Box className="flex-1 items-center justify-center px-6">
            <VStack className="items-center gap-3">
              <Box className="rounded-full bg-muted p-4">
                <Bookmark className="h-8 w-8 text-muted-foreground" />
              </Box>
              <Text className="text-center text-base font-semibold text-foreground">
                No bookmarks yet
              </Text>
              <Text className="text-center text-sm text-muted-foreground">
                Save memos from the feed to find them here later.
              </Text>
            </VStack>
          </Box>
        )}
      </Box>
    </SafeAreaView>
  );
}
