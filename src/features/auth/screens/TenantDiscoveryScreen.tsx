import { router } from "expo-router";
import { Mail, Tag } from "lucide-react-native";
import { useState } from "react";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import {
  AuthFormCard,
  AuthScreenShell,
} from "@/src/features/auth/components/AuthScreenShell";
import { AUTH_ROUTE_PATHS, AUTH_ROUTES } from "@/src/features/auth/navigation";
import {
  Button,
  ButtonSpinner,
  ButtonText,
} from "@/src/shared/components/ui/button";
import { Input, InputField, InputSlot } from "@/src/shared/components/ui/input";
import { Link, LinkText } from "@/src/shared/components/ui/link";
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsTrigger,
  TabsTriggerText,
} from "@/src/shared/components/ui/tabs";
import { FormErrorMessage } from "@/src/shared/components/form-error-message";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import { cn } from "@/src/shared/utils/cn";
import { getFormErrorMessage } from "@/src/shared/utils/formErrors";
import { Box } from "@/src/shared/components/ui/box";
import { Heading } from "@/src/shared/components/ui/heading";

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
    setError(null);
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

      router.push(AUTH_ROUTES.admissionNumber);
    } catch (err) {
      setError(
        getFormErrorMessage(
          err,
          mode === "email"
            ? "No institution found for this email domain. Use your official institutional email address."
            : "Institution not found. Check your school code and try again.",
        ),
      );
    } finally {
      setIsSearching(false);
    }
  };

  const canContinue = isInputValid(mode, inputValue) && !isSearching;

  return (
    <AuthScreenShell contentClassName="justify-center">
      <VStack className="mb-6 items-center gap-2">
        <Heading size="lg" className="text-center font-bold text-primary">
          Find your institution
        </Heading>
        <Text className="text-center text-sm text-muted-foreground">
          Sign in with your official email or school shortcode.
        </Text>
      </VStack>

      <AuthFormCard>
        <Box
          className="mb-6"
          onLayout={(event) => {
            const width = event.nativeEvent.layout.width - 8;
            setTabTriggerWidth(width / 2);
          }}
        >
          <Tabs value={mode} onValueChange={handleTabChange} variant="filled">
            <TabsList className="h-12 w-full rounded-xl bg-muted/80">
              <TabsIndicator />
              <TabsTrigger
                value="email"
                className={cn("items-center justify-center rounded-lg py-2")}
                style={
                  tabTriggerWidth > 0 ? { width: tabTriggerWidth } : undefined
                }
              >
                <TabsTriggerText className="text-sm font-semibold data-[selected=true]:text-primary">
                  Email
                </TabsTriggerText>
              </TabsTrigger>
              <TabsTrigger
                value="shortcode"
                className="items-center justify-center rounded-lg py-2"
                style={
                  tabTriggerWidth > 0 ? { width: tabTriggerWidth } : undefined
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
          <Input className="h-12">
            <InputSlot className="pl-1">
              {mode === "email" ? (
                <Mail className="h-5 w-5 text-primary" />
              ) : (
                <Tag className="h-5 w-5 text-primary" />
              )}
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
              className="px-2 text-base text-foreground"
            />
          </Input>

          <Text className="px-1 text-sm text-muted-foreground">
            We&apos;ll detect your institution automatically.
          </Text>

          <FormErrorMessage message={error} />

          <Button
            size="lg"
            isDisabled={!canContinue}
            onPress={handleContinue}
            className="mt-2 h-12 rounded-xl bg-secondary data-[active=true]:bg-secondary/90"
          >
            {isSearching ? <ButtonSpinner /> : null}
            <ButtonText className="text-sm font-semibold text-secondary-foreground">
              {isSearching ? "Searching..." : "Continue"}
            </ButtonText>
          </Button>
        </VStack>
      </AuthFormCard>

      <Box className="mt-6 items-center">
        <Link href="#" className="items-center">
          <LinkText className="text-sm text-primary underline decoration-primary/30">
            Need help finding your shortcode?
          </LinkText>
        </Link>
      </Box>
    </AuthScreenShell>
  );
}
