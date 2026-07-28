import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonText } from "@/src/shared/components/ui/button";
import { Image } from "@/src/shared/components/ui/image";
import { Text } from "@/src/shared/components/ui/text";
import { router } from "expo-router";
import { setHasSeenWelcome } from "../storage/onboardingStorage";

const IMAGE = require("@/src/assets/images/welcome.jpg");

const PRIMARY = "#234698";
const PRIMARY_DEEP = "#162d5c";
const SECONDARY = "#F36F12";

export default function WelcomeScreen() {
  function handleContinue() {
    setHasSeenWelcome();
    router.replace("/(auth)/tenant-discovery");
  }

  return (
    <Box className="flex-1 bg-primary">
      <StatusBar style="light" />

      <Animated.View
        entering={FadeIn.duration(900)}
        style={StyleSheet.absoluteFill}
      >
        <Image
          source={IMAGE}
          size="none"
          className="w-full h-full"
          resizeMode="cover"
          accessibilityLabel="Student using TVET-MEMO on a phone"
        />
      </Animated.View>

      <LinearGradient
        colors={[
          "rgba(22, 45, 92, 0.25)",
          "rgba(35, 70, 152, 0.35)",
          "rgba(22, 45, 92, 0.88)",
          PRIMARY_DEEP,
        ]}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={["transparent", `${SECONDARY}33`, `${SECONDARY}55`]}
        locations={[0.55, 0.82, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Box
        className="absolute -top-16 -right-10 w-56 h-56 rounded-full"
        style={{ backgroundColor: `${SECONDARY}28` }}
        pointerEvents="none"
      />
      <Box
        className="absolute top-1/3 -left-20 w-72 h-72 rounded-full"
        style={{ backgroundColor: `${PRIMARY}40` }}
        pointerEvents="none"
      />

      <SafeAreaView style={{ flex: 1 }}>
        <Box className="flex-1 justify-end px-8 pb-8">
          <Animated.View
            entering={FadeInDown.delay(180).duration(560).springify()}
          >
            <Text className="text-primary-foreground text-5xl font-bold tracking-tight">
              TVET-MEMO
            </Text>
            <Box
              className="mt-3 h-1 w-14 rounded-full"
              style={{ backgroundColor: SECONDARY }}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(340).duration(560).springify()}
          >
            <Text className="text-primary-foreground/90 text-base leading-6 mt-5">
              Let&apos;s take care of your memo delivery with a faster, simpler
              and more reliable experience.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(500).duration(560).springify()}
          >
            <Button
              className="items-center h-14 mt-10 rounded-full bg-white data-[hover=true]:bg-white/90 data-[active=true]:bg-white/90"
              onPress={handleContinue}
            >
              <ButtonText className="text-primary text-lg font-bold">
                Get started
              </ButtonText>
            </Button>
          </Animated.View>
        </Box>
      </SafeAreaView>
    </Box>
  );
}
