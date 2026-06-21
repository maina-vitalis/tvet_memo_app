import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";

import { Box } from "@/src/components/ui/box";
import { HStack } from "@/src/components/ui/hstack";
import {
  BellIcon,
  CopyIcon,
  GlobeIcon,
  SettingsIcon,
} from "@/src/components/ui/icon";
import { Pressable } from "@/src/components/ui/pressable";
import { Text } from "@/src/components/ui/text";

type TabConfig = {
  name: string;
  label: string;
  icon: typeof CopyIcon;
};

const TAB_ITEMS: TabConfig[] = [
  { name: "feed", label: "Feed", icon: CopyIcon },
  { name: "alerts", label: "Alerts", icon: BellIcon },
  { name: "analytics", label: "Analytics", icon: GlobeIcon },
  { name: "settings", label: "Settings", icon: SettingsIcon },
];

function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <Box className="border-t border-border bg-card shadow-lg md:hidden">
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
                isFocused ? "bg-primary" : "data-[active=true]:bg-muted"
              }`}
            >
              <IconComponent
                className={`h-4.5 w-4.5 ${
                  isFocused
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              />
              <Text
                className={`mt-1 text-xs ${
                  isFocused
                    ? "font-medium text-primary-foreground"
                    : "text-muted-foreground"
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
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="feed" options={{ title: "Feed" }} />
      <Tabs.Screen name="alerts" options={{ title: "Alerts" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
