import { router } from "expo-router";
import { Lock } from "lucide-react-native";
import { useEffect, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/src/components/ui/box";
import { Heading } from "@/src/components/ui/heading";
import { HStack } from "@/src/components/ui/hstack";
import { Text } from "@/src/components/ui/text";
import { VStack } from "@/src/components/ui/vstack";
import { useAuth } from "@/src/lib/auth-context";

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

export function BootloaderScreen() {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<string>(BOOT_STAGES[0].status);
  const [progressLabel, setProgressLabel] = useState<number>(
    BOOT_STAGES[0].progress,
  );
  const trackWidth = useSharedValue(0);
  const progress = useSharedValue(BOOT_STAGES[0].progress);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.88, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  useEffect(() => {
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
      router.replace(
        isAuthenticated ? "/(tabs)/feed" : "/(auth)/tenant-discovery",
      );
    }, NAVIGATE_DELAY_MS);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(navigateTimer);
    };
  }, [isAuthenticated, progress]);

  const brandStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  const progressFillStyle = useAnimatedStyle(() => ({
    width: (trackWidth.value * progress.value) / 100,
  }));

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    trackWidth.value = event.nativeEvent.layout.width;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 justify-between bg-[#1a365d] px-6 py-12">
        <Box className="flex-1" />

        <Animated.View style={[{ flex: 1, width: "100%" }, brandStyle]}>
          <Box className="flex-1 items-center justify-center">
            <Box
              className="mb-6 h-20 w-20 items-center justify-center rounded-2xl bg-white"
              style={{
                transform: [{ rotate: "45deg" }],
                shadowColor: "#000000",
                shadowOpacity: 0.15,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              }}
            >
              <Box
                className="h-10 w-10 rounded bg-secondary"
                style={{ transform: [{ rotate: "-45deg" }] }}
              />
            </Box>

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
        </Animated.View>

        <VStack className="w-full max-w-sm flex-1 justify-end self-center pb-8">
          <HStack className="mb-3 w-full items-center justify-between px-1">
            <Text className="flex-1 pr-3 text-xs text-[#adc7f7]">{status}</Text>
            <Text className="text-xs text-[#adc7f7] opacity-70">
              {progressLabel}%
            </Text>
          </HStack>

          <Box
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
                  shadowColor: "#ea580c",
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 0 },
                },
              ]}
            />
          </Box>

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
