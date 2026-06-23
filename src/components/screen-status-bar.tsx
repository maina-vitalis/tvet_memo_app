import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useCallback } from "react";
import { Platform } from "react-native";

type ScreenStatusBarProps = {
  style: "light" | "dark" | "auto";
  backgroundColor?: string;
};

export function ScreenStatusBar({
  style,
  backgroundColor = "#ffffff",
}: ScreenStatusBarProps) {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "android") {
        SystemUI.setBackgroundColorAsync(backgroundColor).catch(() => {});
      }
    }, [backgroundColor]),
  );

  return <StatusBar style={style} />;
}
