import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonText } from "@/src/shared/components/ui/button";
import { Image } from "@/src/shared/components/ui/image";
import { Text } from "@/src/shared/components/ui/text";
import { setHasSeenWelcome } from "../storage/onboardingStorage";

const IMAGE = require("@/src/assets/images/welcome.jpg");
function handleContinue() {
  void setHasSeenWelcome().then(() => {
    router.replace("/(auth)/tenant-discovery");
  });
}

export default function WelcomeScreen() {


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
          "transparent",
          "rgba(27, 58, 124, 0.25)",
          "rgba(27, 58, 124, 0.82)",
          "rgba(27, 58, 124, 0.96)",
        ]}
        locations={[0, 0.35, 0.72, 1]}
        pointerEvents="none"
        style={styles.bottomScrim}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <Box className="flex-1 justify-end px-8 pb-8">
          <Animated.View
            entering={FadeInDown.delay(180).duration(560).springify()}
          >
            <Text className="text-5xl font-bold tracking-tight text-primary-foreground">
              TVET MEMO
            </Text>
            <Box className="mt-3 h-1 w-14 rounded-full bg-secondary" />
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
              className="mt-10 h-14 rounded-xl bg-secondary shadow-lg data-[active=true]:bg-secondary/90 data-[hover=true]:bg-secondary/90"
              onPress={handleContinue}
            >
              <ButtonText className="text-lg font-bold text-secondary-foreground">
                Get started
              </ButtonText>
            </Button>
          </Animated.View>
        </Box>
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  bottomScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "58%",
  },
});
