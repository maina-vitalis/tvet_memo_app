import { router } from "expo-router";
import { Landmark, Mail, Tag } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/src/shared/components/ui/button";
import { Input, InputField, InputSlot } from "@/src/shared/components/ui/input";
import { Link, LinkText } from "@/src/shared/components/ui/link";
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsTrigger,
  TabsTriggerText,
} from "@/src/shared/components/ui/tabs";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { AUTH_ROUTE_PATHS, AUTH_ROUTES } from "@/src/features/auth/navigation";

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
  const { discoverInstitution } = useAuth();
  const [mode, setMode] = useState<DiscoveryMode>("email");
  const [inputValue, setInputValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabTriggerWidth, setTabTriggerWidth] = useState(0);

  const handleTabChange = (value: string) => {
    const nextMode = value as DiscoveryMode;
    setMode(nextMode);
    setInputValue("");
  };

  const handleContinue = async () => {
    if (!isInputValid(mode, inputValue) || isSearching) {
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      await discoverInstitution(inputValue.trim(), mode);

      if (mode === "email") {
        const normalizedEmail = inputValue.trim().toLowerCase();
        router.push({
          pathname: AUTH_ROUTE_PATHS.login,
          params: { email: normalizedEmail },
        });
        return;
      }

      router.push(AUTH_ROUTES.loginRegistry);
    } catch {
      setError("Institution not found. Check your email domain or shortcode.");
    } finally {
      setIsSearching(false);
    }
  };

  const canContinue = isInputValid(mode, inputValue) && !isSearching;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 bg-background">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Box className="absolute inset-0 overflow-hidden">
            <Box className="absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary/10" />
            <Box className="absolute top-[60%] right-[-10%] h-[60%] w-[40%] rounded-full bg-muted/60" />
          </Box>

          <VStack className="z-10 flex-1 justify-center px-4 pb-8 md:px-6">
            <VStack className="mb-8 items-center">
              <Box className="mb-6 h-16 w-16 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                <Landmark className="h-8 w-8 text-primary" />
              </Box>
              <Text className="text-center text-2xl font-bold leading-8 text-primary md:text-[28px]">
                Welcome — let&apos;s find your institution.
              </Text>
            </VStack>

            <Box className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <Box
                className="mb-6"
                onLayout={(event) => {
                  const width = event.nativeEvent.layout.width - 8;
                  setTabTriggerWidth(width / 2);
                }}
              >
                <Tabs
                  value={mode}
                  onValueChange={handleTabChange}
                  variant="filled"
                >
                  <TabsList className="w-full">
                    <TabsIndicator />
                    <TabsTrigger
                      value="email"
                      className="items-center justify-center py-2"
                      style={
                        tabTriggerWidth > 0
                          ? { width: tabTriggerWidth }
                          : undefined
                      }
                    >
                      <TabsTriggerText className="text-sm font-semibold data-[selected=true]:text-primary">
                        Email
                      </TabsTriggerText>
                    </TabsTrigger>
                    <TabsTrigger
                      value="shortcode"
                      className="items-center justify-center py-2"
                      style={
                        tabTriggerWidth > 0
                          ? { width: tabTriggerWidth }
                          : undefined
                      }
                    >
                      <TabsTriggerText className="text-sm font-semibold data-[selected=true]:text-primary">
                        Shortcode
                      </TabsTriggerText>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </Box>

              <VStack space="sm">
                <Input className="rounded-lg border-border bg-background data-[focus=true]:border-primary">
                  <InputSlot className="pl-4">
                    {mode === "email" ? (
                      <Mail className="h-5.5 w-5.5 text-muted-foreground" />
                    ) : (
                      <Tag className="h-5.5 w-5.5 text-muted-foreground" />
                    )}
                  </InputSlot>
                  <InputField
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    keyboardType={
                      mode === "email" ? "email-address" : "default"
                    }
                    placeholder={
                      mode === "email"
                        ? "you@institution.ac.ke"
                        : "e.g. KMTC-NRB"
                    }
                    value={inputValue}
                    onChangeText={setInputValue}
                    className="px-3 py-3 text-base text-foreground placeholder:text-red-500"
                  />
                </Input>

                <Text className="px-1 text-sm text-muted-foreground">
                  We&apos;ll detect your institution automatically.
                </Text>

                {error ? (
                  <Text className="px-1 text-sm text-destructive">{error}</Text>
                ) : null}

                <Button
                  variant="default"
                  size="lg"
                  isDisabled={!canContinue}
                  onPress={handleContinue}
                  className="mt-2 rounded-lg shadow-sm"
                >
                  {isSearching ? <ButtonSpinner /> : null}
                  <ButtonText className="text-sm font-semibold">
                    {isSearching ? "Searching..." : "Continue"}
                  </ButtonText>
                </Button>
              </VStack>
            </Box>

            <Box className="mt-6 items-center">
              <Link href="#" className="items-center">
                <LinkText className="text-sm text-primary underline decoration-primary/30">
                  Need help finding your shortcode?
                </LinkText>
              </Link>
            </Box>
          </VStack>
        </KeyboardAvoidingView>
      </Box>
    </SafeAreaView>
  );
}
