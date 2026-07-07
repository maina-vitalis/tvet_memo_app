import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { Tabs } from "expo-router";
import {
  BellRing,
  Bookmark,
  LucideProps,
  MessageSquare,
  Plus,
  Settings,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCanCreateMemo } from "@/src/features/memos/hooks/useMemoPermissions";
import { MEMO_ROUTES } from "@/src/features/memos/navigation";
import { ScreenStatusBar } from "@/src/shared/components/screen-status-bar";
import { Box } from "@/src/shared/components/ui/box";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { Text } from "@/src/shared/components/ui/text";

type TabConfig = {
  name: string;
  label: string;
  icon: React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;
};

const LEFT_TAB_ITEMS: TabConfig[] = [
  { name: "feed", label: "Feed", icon: MessageSquare },
  { name: "alerts", label: "Alerts", icon: BellRing },
];

const RIGHT_TAB_ITEMS: TabConfig[] = [
  { name: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { name: "settings", label: "Settings", icon: Settings },
];

const ALL_TAB_ITEMS = [...LEFT_TAB_ITEMS, ...RIGHT_TAB_ITEMS];

type TabButtonProps = {
  tab: TabConfig;
  isFocused: boolean;
  onPress: () => void;
};

function TabButton({ tab, isFocused, onPress }: TabButtonProps) {
  const IconComponent = tab.icon;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      className={`min-w-[64px] flex-1 items-center justify-center rounded-xl px-2 py-1 active:scale-95 ${
        isFocused ? "" : "data-[active=true]:bg-muted"
      }`}
    >
      <IconComponent
        strokeWidth={isFocused ? "2.5" : "1.5"}
        stroke={isFocused ? "#234698" : "black"}
        className={`h-4.5 w-4.5 ${
          isFocused ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      />
      <Text
        className={`mt-1 text-xs ${isFocused ? "font-bold text-primary" : ""}`}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

function MemoCreateTabButton() {
  return (
    <Box className="min-w-[72px] flex-1 items-center justify-end pb-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create memo"
        onPress={() => router.push(MEMO_ROUTES.create)}
        className="-mt-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:scale-95 data-[active=true]:bg-primary/90"
      >
        <Plus className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
      </Pressable>
      <Text className="mt-1 text-xs font-bold text-primary">Create</Text>
    </Box>
  );
}

function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const canCreateMemo = useCanCreateMemo();

  const renderTab = (tab: TabConfig) => {
    const routeIndex = state.routes.findIndex((route) => route.name === tab.name);

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
        {canCreateMemo ? (
          <>
            {LEFT_TAB_ITEMS.map(renderTab)}
            <MemoCreateTabButton />
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
  return (
    <>
      <ScreenStatusBar style="dark" backgroundColor="#ffffff" />
      <Tabs
        tabBar={(props) => <BottomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="home" options={{ href: null }} />
        <Tabs.Screen name="feed" options={{ title: "Feed" }} />
        <Tabs.Screen name="alerts" options={{ title: "Alerts" }} />
        <Tabs.Screen name="bookmarks" options={{ title: "Bookmarks" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      </Tabs>
    </>
  );
}
