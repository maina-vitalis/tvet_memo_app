import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/src/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/src/components/ui/button";
import { HStack } from "@/src/components/ui/hstack";
import { Input, InputField, InputSlot } from "@/src/components/ui/input";
import { Link, LinkText } from "@/src/components/ui/link";
import { Pressable } from "@/src/components/ui/pressable";
import { Spinner } from "@/src/components/ui/spinner";
import { Text } from "@/src/components/ui/text";
import { VStack } from "@/src/components/ui/vstack";

type DiscoveryMode = "email" | "shortcode";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isInputValid(mode: DiscoveryMode, value: string) {
  const trimmed = value.trim();

  if (mode === "email") {
    return EMAIL_PATTERN.test(trimmed);
  }

  return trimmed.length >= 3;
}

export default function TenantDiscoveryScreen() {
  const [mode, setMode] = useState<DiscoveryMode>("email");
  const [inputValue, setInputValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [toggleWidth, setToggleWidth] = useState(0);

  const sliderOffset = useSharedValue(0);

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderOffset.value }],
  }));

  const switchMode = useCallback(
    (nextMode: DiscoveryMode) => {
      if (nextMode === mode) {
        return;
      }

      setMode(nextMode);
      setInputValue("");
      sliderOffset.value = withTiming(
        nextMode === "email" ? 0 : toggleWidth / 2,
        {
          duration: 300,
        },
      );
    },
    [mode, sliderOffset, toggleWidth],
  );

  const handleContinue = () => {
    if (!isInputValid(mode, inputValue)) {
      return;
    }

    setIsSearching(true);
    // TODO: wire up institution lookup API
    setTimeout(() => setIsSearching(false), 1500);
  };

  const canContinue = isInputValid(mode, inputValue) && !isSearching;

  return (
    <SafeAreaView className="flex-1 bg-background-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Box className="absolute inset-0 overflow-hidden">
          <Box className="absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary-100 opacity-30" />
          <Box className="absolute top-[60%] right-[-10%] h-[60%] w-[40%] rounded-full bg-background-200 opacity-40" />
        </Box>

        <VStack className="z-10 flex-1 justify-center px-4 pb-8 md:px-6">
          <VStack className="mb-8 items-center">
            <Box className="mb-6 h-16 w-16 items-center justify-center rounded-xl border border-outline-100 bg-background-0 shadow-sm">
              <MaterialIcons
                name="account-balance"
                size={30}
                color="rgb(26 54 93)"
              />
            </Box>
            <Text className="text-center text-2xl font-bold leading-7.5 text-primary-700 md:text-[28px] md:leading-8.5">
              Welcome — let&apos;s find your institution.
            </Text>
          </VStack>

          <Box className="rounded-xl border border-outline-100 bg-background-0 p-6 shadow-sm">
            <Box
              className="relative mb-6 rounded-lg bg-background-100 p-1"
              onLayout={(event) => {
                const width = event.nativeEvent.layout.width - 8;
                setToggleWidth(width);
                sliderOffset.value = mode === "email" ? 0 : width / 2;
              }}
            >
              {toggleWidth > 0 ? (
                <Animated.View
                  style={[
                    sliderStyle,
                    {
                      position: "absolute",
                      top: 4,
                      left: 4,
                      width: toggleWidth / 2,
                      height: "100%",
                    },
                  ]}
                  className="rounded-md bg-background-0 shadow-sm"
                />
              ) : null}

              <HStack>
                <Pressable
                  onPress={() => switchMode("email")}
                  className="flex-1 items-center py-2"
                >
                  <Text
                    className={
                      mode === "email"
                        ? "text-sm font-semibold text-primary-700"
                        : "text-sm font-semibold text-typography-500"
                    }
                  >
                    Email
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => switchMode("shortcode")}
                  className="flex-1 items-center py-2"
                >
                  <Text
                    className={
                      mode === "shortcode"
                        ? "text-sm font-semibold text-primary-700"
                        : "text-sm font-semibold text-typography-500"
                    }
                  >
                    Shortcode
                  </Text>
                </Pressable>
              </HStack>
            </Box>

            <VStack space="sm">
              <Input className="rounded-lg border-outline-200 bg-background-50 data-[focus=true]:border-primary-700">
                <InputSlot className="pl-4">
                  <MaterialIcons
                    name={mode === "email" ? "mail-outline" : "sell"}
                    size={22}
                    color="rgb(100 116 139)"
                  />
                </InputSlot>
                <InputField
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                  keyboardType={mode === "email" ? "email-address" : "default"}
                  placeholder={
                    mode === "email" ? "you@institution.ac.ke" : "e.g. KMTC-NRB"
                  }
                  value={inputValue}
                  onChangeText={setInputValue}
                  className="px-3 py-3 text-base text-typography-900"
                />
              </Input>

              <Text className="px-1 text-sm text-typography-500">
                We&apos;ll detect your institution automatically.
              </Text>

              {isSearching ? (
                <HStack className="mb-4 items-center justify-center py-2">
                  <Spinner size="small" className="text-primary-700" />
                  <Text className="ml-2 text-xs font-medium text-primary-700">
                    Searching...
                  </Text>
                </HStack>
              ) : null}

              <Button
                action="primary"
                variant="solid"
                size="lg"
                isDisabled={!canContinue}
                onPress={handleContinue}
                className="mt-2 rounded-lg bg-primary-700 shadow-sm data-[active=true]:bg-primary-800 data-[hover=true]:bg-primary-600"
              >
                <ButtonText className="text-sm font-semibold text-typography-0">
                  Continue
                </ButtonText>
                <ButtonIcon
                  as={MaterialIcons}
                  name="filter"
                  size="md"
                  className="text-typography-0"
                />
              </Button>
            </VStack>
          </Box>

          <Box className="mt-6 items-center">
            <Link href="#" className="items-center">
              <LinkText
                underline
                className="text-sm text-primary-700 underline decoration-primary-700/30"
              >
                Need help finding your shortcode?
              </LinkText>
            </Link>
          </Box>
        </VStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
