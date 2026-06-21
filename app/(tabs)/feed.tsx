import { Avatar, AvatarImage } from "@/src/components/ui/avatar";
import { Badge, BadgeIcon, BadgeText } from "@/src/components/ui/badge";
import { Box } from "@/src/components/ui/box";
import { Card } from "@/src/components/ui/card";
import { Heading } from "@/src/components/ui/heading";
import { HStack } from "@/src/components/ui/hstack";
import { Image } from "@/src/components/ui/image";
import { Input, InputField, InputSlot } from "@/src/components/ui/input";
import { Pressable } from "@/src/components/ui/pressable";
import { ScrollView } from "@/src/components/ui/scroll-view";
import { Text } from "@/src/components/ui/text";
import { VStack } from "@/src/components/ui/vstack";
import {
  AlertCircle,
  CheckCircle,
  GripVertical,
  MessageCircle,
  RefreshCcw,
  Search,
} from "lucide-react-native";
import { useState } from "react";

const INSTITUTION_LOGO = "./../../src/assets/images/icon.png";
type MemoTag = {
  label: string;
  tone: "primary" | "destructive" | "muted";
  showWarning?: boolean;
};

type MemoItem = {
  id: string;
  author: string;
  meta: string;
  title: string;
  excerpt: string;
  tags: MemoTag[];
  avatarUri?: string;
  avatarFallbackIcon?: "campaign";
  unread?: boolean;
  acknowledged?: boolean;
  titleEmphasis?: "headline" | "label";
};

const FEED_ITEMS: MemoItem[] = [
  {
    id: "1",
    author: "Dr. Sarah Jenkins",
    meta: "Dean of Technical Studies • 10:45 AM",
    title: "Updated Safety Protocols for Engineering Labs",
    excerpt:
      "Please review the attached document outlining the revised safety procedures effective immediately for all structural engineering lab sessions. Mandatory acknowledgment is required before next week's practicals.",
    tags: [
      { label: "Policy Update", tone: "primary" },
      { label: "Action Required", tone: "destructive", showWarning: true },
    ],
    avatarUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAdoao7txQO7r2sVFWtY5AazrcuOdMEuQE7OyNXuCl3WN_SOJilGil9QvdBuxWbOpXQpxDN5D98ngYUs3VMKFpH_XS-ZYojtNFcJSm4JUWu0ja86R5Cj8kY4eBULsN3hPTE96WPHNyUPT3MqiBgZZECAUpnQrBibG1DKCT6oiZZ-xOyqBMTQk5kMO1NwPIuYKrGG9IyweZzNxQUpPaLFgWB3qnQvak0G7d4Dp76YNRu63FszFZBalmBZ31E4kWGbMt0-ZhiNv922SfH",
    unread: true,
    titleEmphasis: "headline",
  },
  {
    id: "2",
    author: "Campus Administration",
    meta: "Yesterday, 2:15 PM",
    title: "Q3 Maintenance Schedule Notification",
    excerpt:
      "The main campus HVAC systems will undergo scheduled maintenance this coming weekend. Building B will experience brief power interruptions. Plan your weekend access accordingly.",
    tags: [{ label: "Facilities", tone: "muted" }],
    avatarFallbackIcon: "campaign",
    acknowledged: true,
    titleEmphasis: "label",
  },
  {
    id: "3",
    author: "Prof. Marcus Thorne",
    meta: "Advanced Manufacturing • Nov 12",
    title: "New CNC Machining Module Materials Available",
    excerpt:
      "I've uploaded the supplementary CAD files and toolpath simulations for next week's advanced milling module. Please review them before the lecture to ensure we can jump straight into the practical demonstration.",
    tags: [{ label: "Course Material", tone: "muted" }],
    avatarUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuASneBC6J4_qquzep4tXr_Bt7_BmqVAQXLYFlPG0gkv_DA0mm62M_Wh2U9ghNu2On7pmhX_NUL9zLXw3DE8BrNEVGMk_OXnKA49Xb1lASYGIpXBt5KXkmLC1ULWkzgOGDDmymX6USIb4iO931N-m9EUuklhV1ozZB9xavD6MikrJTAau9N_val8HGuprEZ3jQdDG5qn7iSiAhg10KnYKB0rVglFI4Ya2w24QGJetAvSSC__BvvPhUYwJNxebhgAYsQqmjxzJyd3CpuZ",
    titleEmphasis: "label",
  },
];

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

function MemoCard({ item }: { item: MemoItem }) {
  return (
    <Pressable
      onPress={() => {}}
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
            <Text className="text-sm font-semibold text-foreground">
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

export default function FeedScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Box className="flex-1 bg-background">
      <Box className="border-b border-border bg-card px-4 py-2 shadow-sm">
        <HStack className="items-center justify-between">
          <HStack className="items-center gap-2">
            <Image
              source={{ uri: INSTITUTION_LOGO }}
              className="h-8 w-8 rounded-full"
              accessibilityLabel="Institution logo"
            />
            <Heading
              size="md"
              className="font-bold tracking-tight text-primary"
            >
              TVET Connect
            </Heading>
          </HStack>

          <Pressable className="h-10 w-10 items-center justify-center rounded-full data-[active=true]:bg-muted">
            <RefreshCcw className="h-5 w-5 text-muted-foreground" />
          </Pressable>
        </HStack>
      </Box>

      {/* <HStack className="items-center justify-center gap-1 bg-accent px-4 py-2">
        <CheckCircleIcon className="h-4 w-4 text-primary" />
        <Text className="text-xs text-muted-foreground">
          All synced • Just now
        </Text>
      </HStack> */}

      <Box className="border-b border-border bg-background/95 px-4 py-4">
        <Input className="h-12 rounded-lg border-border bg-card shadow-sm">
          <InputSlot className="pl-3">
            <Search className="h-4.5 w-4.5 text-muted-foreground" />
          </InputSlot>
          <InputField
            placeholder="Search memos, courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="px-2 text-sm text-foreground"
          />
          <InputSlot className="pr-2">
            <Pressable className="h-8 w-8 items-center justify-center rounded-md data-[active=true]:bg-muted">
              <GripVertical className="h-4.5 w-4.5 text-muted-foreground" />
            </Pressable>
          </InputSlot>
        </Input>
      </Box>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {FEED_ITEMS.map((item) => (
          <MemoCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </Box>
  );
}
