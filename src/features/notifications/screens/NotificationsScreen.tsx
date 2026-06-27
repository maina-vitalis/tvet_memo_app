import { RefreshCcw } from "lucide-react-native";
import { useMemo } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NotificationItem } from "@/src/features/notifications/components/NotificationItem";
import {
  useMarkRead,
  useNotificationsQuery,
} from "@/src/features/notifications/hooks/useNotifications";
import { mapNotificationToItem } from "@/src/features/notifications/utils/mapNotificationToItem";
import { Box } from "@/src/shared/components/ui/box";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { ScrollView } from "@/src/shared/components/ui/scroll-view";
import { ScreenHeader } from "@/src/shared/components/screen-header";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";

export default function NotificationsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } =
    useNotificationsQuery();
  const markRead = useMarkRead();

  const alerts = useMemo(
    () => (data ?? []).map(mapNotificationToItem),
    [data],
  );

  const hasUnread = alerts.some((alert) => alert.unread);

  const handleMarkAllRead = () => {
    alerts
      .filter((alert) => alert.unread)
      .forEach((alert) => markRead.mutate(alert.id));
  };

  const handleAlertPress = (id: string) => {
    markRead.mutate(id);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
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
              <Pressable
                onPress={() => void refetch()}
                className="h-10 w-10 items-center justify-center rounded-full data-[active=true]:bg-muted"
              >
                <RefreshCcw
                  className={`h-5 w-5 text-muted-foreground ${
                    isRefetching ? "opacity-50" : ""
                  }`}
                />
              </Pressable>
            )
          }
        />

        {isLoading ? (
          <Box className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </Box>
        ) : isError ? (
          <Box className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-muted-foreground">
              Could not load notifications. Try refreshing.
            </Text>
          </Box>
        ) : alerts.length === 0 ? (
          <Box className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-muted-foreground">
              No notifications yet.
            </Text>
          </Box>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-3 px-4 pb-6 pt-4 md:px-6 md:pt-6"
            showsVerticalScrollIndicator={false}
          >
            <VStack className="gap-2">
              {alerts.map((alert) => (
                <NotificationItem
                  key={alert.id}
                  alert={alert}
                  onPress={() => handleAlertPress(alert.id)}
                />
              ))}
            </VStack>
          </ScrollView>
        )}
      </Box>
    </SafeAreaView>
  );
}