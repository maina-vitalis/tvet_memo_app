import { Box } from "@/src/components/ui/box";
import { Card } from "@/src/components/ui/card";
import { HStack } from "@/src/components/ui/hstack";
import { Pressable } from "@/src/components/ui/pressable";
import { ScrollView } from "@/src/components/ui/scroll-view";
import { Text } from "@/src/components/ui/text";
import { VStack } from "@/src/components/ui/vstack";
import { ScreenHeader } from "@/src/components/screen-header";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ClipboardList,
  RefreshCcw,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AlertIconTone = "error" | "primary" | "muted";

type AlertItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: LucideIcon;
  iconTone: AlertIconTone;
  unread?: boolean;
};

type AlertGroup = {
  label: string;
  alerts: AlertItem[];
};

const ALERT_GROUPS: AlertGroup[] = [
  {
    label: "Today",
    alerts: [
      {
        id: "1",
        title: "System Maintenance",
        message:
          "The student portal will be down for scheduled maintenance tonight from 12:00 AM to 4:00 AM.",
        time: "10:45 AM",
        icon: AlertTriangle,
        iconTone: "error",
        unread: true,
      },
      {
        id: "2",
        title: "New Module Available",
        message:
          "Module 4: Advanced Circuitry is now unlocked in your Electrical Engineering course.",
        time: "08:30 AM",
        icon: ClipboardList,
        iconTone: "primary",
        unread: true,
      },
    ],
  },
  {
    label: "Yesterday",
    alerts: [
      {
        id: "3",
        title: "Assignment Graded",
        message:
          "Your recent submission for 'Safety Protocols' has been graded. You scored 95%.",
        time: "2:15 PM",
        icon: CheckCircle,
        iconTone: "muted",
      },
      {
        id: "4",
        title: "Upcoming Workshop",
        message:
          "Reminder: The mandatory machinery safety workshop begins tomorrow at 10:00 AM in Lab B.",
        time: "9:00 AM",
        icon: Calendar,
        iconTone: "muted",
      },
    ],
  },
];

function iconToneClassName(tone: AlertIconTone) {
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

function AlertCard({
  alert,
  onPress,
}: {
  alert: AlertItem;
  onPress: () => void;
}) {
  const Icon = alert.icon;
  const tone = iconToneClassName(alert.iconTone);

  return (
    <Pressable
      onPress={onPress}
      className="active:scale-[0.99] data-[active=true]:opacity-95"
    >
      <Card
        size="sm"
        className={`relative gap-0 rounded-lg shadow-sm ${
          alert.unread
            ? "border-0 border-l-4 border-l-secondary"
            : "border border-border opacity-80"
        }`}
      >
        {alert.unread ? (
          <Box className="absolute top-4 right-4 h-2 w-2 rounded-full bg-secondary" />
        ) : null}

        <HStack className="items-start gap-3">
          <Box
            className={`h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone.container}`}
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

function AlertGroupSection({
  group,
  onAlertPress,
}: {
  group: AlertGroup;
  onAlertPress: (id: string) => void;
}) {
  return (
    <VStack className="gap-3">
      <Text className="px-1 text-sm font-semibold text-muted-foreground">
        {group.label}
      </Text>
      <VStack className="gap-2">
        {group.alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onPress={() => onAlertPress(alert.id)}
          />
        ))}
      </VStack>
    </VStack>
  );
}

export default function AlertsScreen() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const groups = useMemo(
    () =>
      ALERT_GROUPS.map((group) => ({
        ...group,
        alerts: group.alerts.map((alert) => ({
          ...alert,
          unread: alert.unread && !readIds.has(alert.id),
        })),
      })),
    [readIds],
  );

  const hasUnread = groups.some((group) =>
    group.alerts.some((alert) => alert.unread),
  );

  const handleMarkAllRead = () => {
    setReadIds(
      new Set(
        ALERT_GROUPS.flatMap((group) => group.alerts.map((alert) => alert.id)),
      ),
    );
  };

  const handleAlertPress = (id: string) => {
    setReadIds((current) => new Set([...current, id]));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 bg-background">
        <ScreenHeader
          title="Alerts"
          subtitle="Stay updated on your courses and system notices."
          rightAction={
            hasUnread ? (
              <Pressable
                onPress={handleMarkAllRead}
                className="rounded-lg px-2 py-1 data-[active=true]:bg-accent"
              >
                <Text className="text-xs font-medium text-primary">
                  Mark all read
                </Text>
              </Pressable>
            ) : (
              <Pressable className="h-10 w-10 items-center justify-center rounded-full data-[active=true]:bg-muted">
                <RefreshCcw className="h-5 w-5 text-muted-foreground" />
              </Pressable>
            )
          }
        />

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 px-4 pb-6 pt-4 md:px-6 md:pt-6"
          showsVerticalScrollIndicator={false}
        >
          {groups.map((group, index) => (
            <Box key={group.label} className={index > 0 ? "mt-1" : ""}>
              <AlertGroupSection
                group={group}
                onAlertPress={handleAlertPress}
              />
            </Box>
          ))}
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
