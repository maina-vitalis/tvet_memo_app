import { router } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { Lock } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Platform, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/src/shared/components/ui/box";
import { Heading } from "@/src/shared/components/ui/heading";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Image } from "@/src/shared/components/ui/image";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import { ScreenStatusBar } from "@/src/shared/components/screen-status-bar";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { AUTH_ROUTES } from "@/src/features/auth/navigation";
import { selectIsFirstSetup } from "@/src/features/auth/store/authSelectors";
import { useAppSelector } from "@/src/shared/store/hooks";
import { loadTokensFromSecureStorage } from "@/src/features/auth/store/authBoot"; // [REFRESH TOKENS] load secrets from secure store on boot
import { getStore } from "@/src/shared/store/storeRef";

const APP_LOGO = require("@/src/assets/images/splash-icon.png");

type BootStage = {
  progress: number;
  status: string;
  at: number;
};

const BOOT_STAGES: BootStage[] = [
  { progress: 64, status: "Initializing local database...", at: 0 },
  { progress: 85, status: "Syncing offline records...", at: 1500 },
  { progress: 100, status: "Launching environment...", at: 3000 },
];

const NAVIGATE_DELAY_MS = 3800;

const PROGRESS_GLOW_STYLE = Platform.select({
  web: {
    boxShadow: "0 0 10px rgba(234, 88, 12, 0.5)",
  },
  default: {
    shadowColor: "#ea580c",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});

export function SplashScreen() {
  const { isAuthenticated } = useAuth();
  const isFirstSetup = useAppSelector(selectIsFirstSetup);
  const [status, setStatus] = useState<string>(BOOT_STAGES[0].status);
  const [progressLabel, setProgressLabel] = useState<number>(
    BOOT_STAGES[0].progress,
  );
  const trackWidth = useSharedValue(0);
  const progress = useSharedValue(BOOT_STAGES[0].progress);

  useEffect(() => {
    ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    // [REFRESH TOKENS] On boot, restore tokens from secure storage into redux before deciding navigation.
    // This runs in parallel with the boot animation.
    loadTokensFromSecureStorage().catch(() => {});

    const timers = BOOT_STAGES.slice(1).map((stage) =>
      setTimeout(() => {
        setStatus(stage.status);
        setProgressLabel(stage.progress);
        progress.value = withTiming(stage.progress, {
          duration: 1000,
          easing: Easing.out(Easing.ease),
        });
      }, stage.at),
    );

    const navigateTimer = setTimeout(() => {
      // After animation, re-read latest auth state (the boot loader may have updated it)
      const currentIsAuthed = getStore().getState().auth.isAuthenticated; // direct read to avoid stale closure
      const currentFirstSetup =
        getStore().getState().auth.isFirstSetup ||
        (getStore().getState().auth.user?.mustChangePassword ?? false);

      if (currentIsAuthed) {
        router.replace(
          currentFirstSetup ? AUTH_ROUTES.resetPassword : AUTH_ROUTES.home,
        );
        return;
      }

      router.replace(AUTH_ROUTES.tenantDiscovery);
    }, NAVIGATE_DELAY_MS);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(navigateTimer);
    };
  }, [isAuthenticated, isFirstSetup, progress]);

  const progressFillStyle = useAnimatedStyle(() => ({
    width: (trackWidth.value * progress.value) / 100,
  }));

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    trackWidth.value = event.nativeEvent.layout.width;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenStatusBar style="auto" />
      <Box className="flex-1 justify-between bg-[#1a365d] px-6 py-12">
        <Box className="flex-1" />

        <Box className="w-full flex-1 items-center justify-center">
          <Image
            source={APP_LOGO}
            size="xl"
            className="mb-6 h-24 w-24"
            accessibilityLabel="TVET Connect logo"
          />

          <Heading
            size="xl"
            className="text-center font-bold tracking-tight text-white"
          >
            TVET Connect
          </Heading>
          <Text className="mt-2 text-center text-sm text-[#adc7f7] opacity-80">
            Institutional Data Portal
          </Text>
        </Box>

        <VStack className="w-full max-w-sm flex-1 justify-end self-center pb-8">
          <HStack className="mb-3 w-full items-center justify-between px-1">
            <Text className="flex-1 pr-3 text-xs text-[#adc7f7]">{status}</Text>
            <Text className="text-xs text-[#adc7f7] opacity-70">
              {progressLabel}%
            </Text>
          </HStack>

          <View
            className="mb-6 h-1 w-full overflow-hidden rounded-full bg-[#2c3645]"
            onLayout={handleTrackLayout}
          >
            <Animated.View
              style={[
                progressFillStyle,
                {
                  height: "100%",
                  borderRadius: 9999,
                  backgroundColor: "rgb(243, 111, 18)",
                },
                PROGRESS_GLOW_STYLE,
              ]}
            />
          </View>

          <HStack className="items-center justify-center gap-2">
            <Lock size={14} color="#d3daea" style={{ opacity: 0.6 }} />
            <Text className="text-[11px] text-[#d3daea] opacity-60">
              Secure Memo Sync
            </Text>
          </HStack>
        </VStack>
      </Box>
    </SafeAreaView>
  );
}
