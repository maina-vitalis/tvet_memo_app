import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenStatusBar } from "@/src/components/screen-status-bar";
import { Box } from "@/src/components/ui/box";
import { HStack } from "@/src/components/ui/hstack";

import { Pressable } from "@/src/components/ui/pressable";
import { Text } from "@/src/components/ui/text";
import {
  BellRing,
  Bookmark,
  LucideProps,
  MessageSquare,
  Settings,
} from "lucide-react-native";

type TabConfig = {
  name: string;
  label: string;
  icon: React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;
};

const TAB_ITEMS: TabConfig[] = [
  { name: "feed", label: "Feed", icon: MessageSquare },
  { name: "alerts", label: "Alerts", icon: BellRing },
  { name: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { name: "settings", label: "Settings", icon: Settings },
];

function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <Box
      className="border-t border-border bg-card shadow-lg md:hidden"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <HStack className="h-16 items-center justify-around px-1">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = TAB_ITEMS.find((item) => item.name === route.name);

          if (!tab) {
            return null;
          }

          const IconComponent = tab.icon;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={() => {
                if (!isFocused) {
                  navigation.navigate(route.name);
                }
              }}
              className={`items-center justify-center rounded-xl px-4 py-1 active:scale-95 ${
                isFocused ? "" : "data-[active=true]:bg-muted"
              }`}
            >
              <IconComponent
                strokeWidth={isFocused ? "2.5" : "1.5"}
                stroke={isFocused ? "#234698" : "black"}
                className={`h-4.5 w-4.5 ${
                  isFocused
                    ? "text-primary-foreground "
                    : "text-muted-foreground"
                }`}
              />
              <Text
                className={`mt-1 text-xs ${
                  isFocused ? "font-bold text-primary" : ""
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
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
        <Tabs.Screen name="feed" options={{ title: "Feed" }} />
        <Tabs.Screen name="alerts" options={{ title: "Alerts" }} />
        <Tabs.Screen name="bookmarks" options={{ title: "Bookmarks" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      </Tabs>
    </>
  );
}
