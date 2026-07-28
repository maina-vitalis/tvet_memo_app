import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonText } from "@/src/shared/components/ui/button";
import { Image } from "@/src/shared/components/ui/image";
import { Text } from "@/src/shared/components/ui/text";
import { setHasSeenWelcome } from "../storage/onboardingStorage";

const IMAGE = require("@/src/assets/images/welcome.jpg");

export default function WelcomeScreen() {
  function handleContinue() {
    setHasSeenWelcome();
    router.replace("/(auth)/tenant-discovery");
  }

  return (
    <Box className="flex-1 bg-primary-container">
      <StatusBar style="light" />

      <Animated.View
        entering={FadeIn.duration(900)}
        style={StyleSheet.absoluteFill}
      >
        <Image
          source={IMAGE}
          size="none"
          className="h-full w-full"
          resizeMode="cover"
          accessibilityLabel="Student using TVET-MEMO on a phone"
        />
      </Animated.View>

      <LinearGradient
        colors={[
          "rgba(27, 58, 124, 0.2)",
          "rgba(35, 70, 152, 0.4)",
          "rgba(27, 58, 124, 0.92)",
          "#1B3A7C",
        ]}
        locations={[0, 0.35, 0.72, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={["transparent", "rgba(243, 111, 18, 0.18)", "rgba(243, 111, 18, 0.42)"]}
        locations={[0.55, 0.82, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Box
        className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-secondary/20"
        pointerEvents="none"
      />
      <Box
        className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-primary/30"
        pointerEvents="none"
      />

      <SafeAreaView style={{ flex: 1 }}>
        <Box className="flex-1 justify-end px-8 pb-8">
          <Animated.View
            entering={FadeInDown.delay(180).duration(560).springify()}
          >
            <Text className="text-5xl font-bold tracking-tight text-primary-foreground">
              TVET MEMO
            </Text>
            <Box className="mt-3 h-1.5 w-16 rounded-full bg-secondary" />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(340).duration(560).springify()}
          >
            <Text className="mt-5 text-base leading-6 text-primary-foreground/90">
              Official memos, alerts, and updates — delivered reliably to your
              institution.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(500).duration(560).springify()}
          >
            <Button
              className="mt-10 h-14 rounded-xl bg-card shadow-lg data-[active=true]:bg-card/95 data-[hover=true]:bg-card/95"
              onPress={handleContinue}
            >
              <ButtonText className="text-lg font-bold text-primary">
                Get started
              </ButtonText>
            </Button>
          </Animated.View>
        </Box>
      </SafeAreaView>
    </Box>
  );
}
