import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs, usePathname, useRouter, type Href } from "expo-router";
import {
  BellRing,
  Bookmark,
  LucideProps,
  MessageSquare,
  Settings,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSyncAuthProfile } from "@/src/features/auth/hooks/useSyncAuthProfile";
import { MemoCreateNavButton } from "@/src/features/memos/components/MemoCreateNavButton";
import { useCanBroadcastMemo } from "@/src/features/memos/hooks/useMemoPermissions";
import { ScreenStatusBar } from "@/src/shared/components/screen-status-bar";
import { Box } from "@/src/shared/components/ui/box";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";

type TabConfig = {
  name: string;
  label: string;
  href: Href;
  icon: React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;
};

const LEFT_TAB_ITEMS: TabConfig[] = [
  { name: "feed", label: "Feed", href: "/(tabs)/feed", icon: MessageSquare },
  { name: "alerts", label: "Alerts", href: "/(tabs)/alerts", icon: BellRing },
];

const RIGHT_TAB_ITEMS: TabConfig[] = [
  {
    name: "bookmarks",
    label: "Bookmarks",
    href: "/(tabs)/bookmarks",
    icon: Bookmark,
  },
  {
    name: "settings",
    label: "Settings",
    href: "/(tabs)/settings",
    icon: Settings,
  },
];

const ALL_TAB_ITEMS = [...LEFT_TAB_ITEMS, ...RIGHT_TAB_ITEMS];

type TabButtonProps = {
  tab: TabConfig;
  isFocused: boolean;
  onPress: () => void;
  layout?: "bottom" | "rail";
};

function TabButton({
  tab,
  isFocused,
  onPress,
  layout = "bottom",
}: TabButtonProps) {
  const IconComponent = tab.icon;
  const isRail = layout === "rail";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      className={
        isRail
          ? `w-full items-center rounded-2xl px-2 py-3 active:scale-95 ${
              isFocused ? "bg-primary/10" : "data-[active=true]:bg-muted"
            }`
          : `min-w-16 flex-1 items-center justify-center rounded-xl px-2 py-1 active:scale-95 ${
              isFocused ? "" : "data-[active=true]:bg-muted"
            }`
      }
    >
      <IconComponent
        strokeWidth={isFocused ? "2.5" : "1.5"}
        stroke={isFocused ? "#234698" : "black"}
        className={`h-4.5 w-4.5 ${
          isFocused ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      />
      <Text
        className={`mt-1 text-xs ${
          isFocused ? "font-bold text-primary" : ""
        } ${isRail ? "text-[10px]" : ""}`}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

function isTabActive(pathname: string, tabName: string): boolean {
  return pathname.includes(`/${tabName}`);
}

function DesktopSideNav() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const canBroadcastMemo = useCanBroadcastMemo();

  return (
    <Box
      className="hidden w-24 border-r border-border bg-card md:flex"
      style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
    >
      <VStack className="flex-1 items-center gap-2 px-2">
        {canBroadcastMemo ? <MemoCreateNavButton variant="rail" /> : null}
        {ALL_TAB_ITEMS.map((tab) => (
          <TabButton
            key={tab.name}
            tab={tab}
            isFocused={isTabActive(pathname, tab.name)}
            layout="rail"
            onPress={() => router.push(tab.href)}
          />
        ))}
      </VStack>
    </Box>
  );
}

function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const canBroadcastMemo = useCanBroadcastMemo();

  const renderTab = (tab: TabConfig) => {
    const routeIndex = state.routes.findIndex(
      (route) => route.name === tab.name,
    );

    if (routeIndex === -1) {
      return null;
    }

    const route = state.routes[routeIndex];
    const isFocused = state.index === routeIndex;

    return (
      <TabButton
        key={route.key}
        tab={tab}
        isFocused={isFocused}
        onPress={() => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        }}
      />
    );
  };

  return (
    <Box
      className="border-t border-border bg-card shadow-lg md:hidden"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <HStack className="h-16 items-end justify-around px-1">
        {canBroadcastMemo ? (
          <>
            {LEFT_TAB_ITEMS.map(renderTab)}
            <MemoCreateNavButton />
            {RIGHT_TAB_ITEMS.map(renderTab)}
          </>
        ) : (
          ALL_TAB_ITEMS.map(renderTab)
        )}
      </HStack>
    </Box>
  );
}

export default function TabsLayout() {
  useSyncAuthProfile();

  return (
    <Box className="flex-1 flex-row bg-background">
      <DesktopSideNav />
      <Box className="flex-1 bg-red-500">
        <ScreenStatusBar style="dark" backgroundColor="#ffffff" />
        <Tabs
          tabBar={(props) => (
            <BottomTabBar {...(props as unknown as BottomTabBarProps)} />
          )}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tabs.Screen name="feed" options={{ title: "Feed" }} />
          <Tabs.Screen name="alerts" options={{ title: "Alerts" }} />
          <Tabs.Screen name="bookmarks" options={{ title: "Bookmarks" }} />
          <Tabs.Screen name="settings" options={{ title: "Settings" }} />
        </Tabs>
      </Box>
    </Box>
  );
}
