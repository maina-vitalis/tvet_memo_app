import { Box } from "@/src/shared/components/ui/box";
import { Card } from "@/src/shared/components/ui/card";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import type { LucideIcon } from "lucide-react-native";

export type NotificationIconTone = "error" | "primary" | "muted";

export type NotificationItemData = {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: LucideIcon;
  iconTone: NotificationIconTone;
  unread?: boolean;
};

function iconToneClassName(tone: NotificationIconTone) {
  if (tone === "error") {
    return {
      container: "bg-destructive/10",
      icon: "text-destructive",
    };
  }

  if (tone === "primary") {
    return {
      container: "bg-accent",
      icon: "text-primary",
    };
  }

  return {
    container: "bg-muted",
    icon: "text-muted-foreground",
  };
}

export function NotificationItem({
  alert,
  onPress,
}: {
  alert: NotificationItemData;
  onPress: () => void;
}) {
  const Icon = alert.icon;
  const tone = iconToneClassName(alert.iconTone);

  return (
    <Pressable
      onPress={onPress}
      className="active:scale-[0.98] transition-all duration-200 data-[active=true]:opacity-95"
    >
      <Card
        size="sm"
        className={`relative gap-0 overflow-hidden rounded-2xl shadow-sm ${
          alert.unread
            ? "border border-border/70 border-l-[3px] border-l-secondary bg-accent/30"
            : "border border-border/70 bg-card opacity-90"
        }`}
      >
        {alert.unread ? (
          <Box className="absolute top-4 right-4 h-2 w-2 rounded-full bg-secondary" />
        ) : null}

        <HStack className="items-start gap-3">
          <Box
            className={`h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tone.container}`}
          >
            <Icon className={`h-5 w-5 ${tone.icon}`} />
          </Box>

          <VStack className="min-w-0 flex-1">
            <HStack className="mb-1 items-start justify-between pr-2">
              <Text
                className={`flex-1 pr-2 ${
                  alert.unread
                    ? "text-sm font-semibold text-foreground"
                    : "text-sm font-medium text-foreground"
                }`}
              >
                {alert.title}
              </Text>
              <Text className="text-[11px] text-muted-foreground">
                {alert.time}
              </Text>
            </HStack>
            <Text
              className="text-sm text-muted-foreground"
              numberOfLines={2}
            >
              {alert.message}
            </Text>
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}
