import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Mail } from "lucide-react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCheckEmail } from "@/src/features/auth/hooks/useAuthMutations";
import { AUTH_ROUTES } from "@/src/features/auth/navigation";
import { selectInstitution } from "@/src/features/auth/store/authSelectors";
import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/src/shared/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/shared/components/ui/form-control";
import { Heading } from "@/src/shared/components/ui/heading";
import { Image } from "@/src/shared/components/ui/image";
import { Input, InputField, InputSlot } from "@/src/shared/components/ui/input";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import { useAppSelector } from "@/src/shared/store/hooks";

const APP_LOGO = require("@/src/assets/images/splash-icon.png");
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const institution = useAppSelector(selectInstitution);
  const { checkEmail, isPending, error, resetError } = useCheckEmail();

  const [email, setEmail] = useState(emailParam?.trim() ?? "");

  useEffect(() => {
    if (!institution) {
      router.replace(AUTH_ROUTES.tenantDiscovery);
    }
  }, [institution]);

  useEffect(() => {
    if (emailParam?.trim()) {
      setEmail(emailParam.trim());
    }
  }, [emailParam]);

  const canSubmit = EMAIL_PATTERN.test(email.trim()) && !isPending;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(AUTH_ROUTES.tenantDiscovery);
  };

  const handleContinue = () => {
    if (!canSubmit) {
      return;
    }

    resetError();
    checkEmail(email.trim().toLowerCase());
  };

  if (!institution) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 bg-background">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Box className="flex-1 px-4 pb-8">
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="mt-2 h-10 w-10 items-center justify-center rounded-full data-[active=true]:bg-muted"
            >
              <ChevronLeft className="h-6 w-6 text-primary" />
            </Pressable>

            <VStack className="mt-4 items-center">
              <Image
                source={APP_LOGO}
                size="md"
                className="mb-3 h-16 w-16"
                accessibilityLabel="TVET Connect logo"
              />
              <Text className="text-lg font-bold text-primary">TVET Connect</Text>
            </VStack>

            <VStack className="mt-8 gap-2">
              <Heading size="xl" className="font-bold text-foreground">
                Sign in with email
              </Heading>
              <Text className="text-base text-muted-foreground">
                Enter your institutional email to continue
              </Text>
              <Text className="text-sm font-medium text-primary">
                {institution.name}
              </Text>
            </VStack>

            <VStack className="mt-8 gap-5">
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-sm font-semibold">
                    Email address
                  </FormControlLabelText>
                </FormControlLabel>
                <Input className="h-12 rounded-xl border-border bg-card data-[focus=true]:border-primary">
                  <InputSlot className="pl-3">
                    <Mail className="h-5 w-5 text-primary" />
                  </InputSlot>
                  <InputField
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="you@institution.ac.ke"
                    value={email}
                    onChangeText={setEmail}
                    accessibilityLabel="Email address"
                    className="px-3 text-base text-foreground"
                  />
                </Input>
              </FormControl>

              {error ? (
                <Text className="text-sm text-destructive">{error}</Text>
              ) : null}

              <Button
                size="lg"
                isDisabled={!canSubmit}
                onPress={handleContinue}
                className="h-12 w-full rounded-xl bg-secondary data-[active=true]:bg-secondary/90"
              >
                {isPending ? (
                  <ButtonSpinner className="text-secondary-foreground" />
                ) : null}
                <ButtonText className="text-sm font-semibold text-secondary-foreground">
                  Continue
                </ButtonText>
              </Button>
            </VStack>
          </Box>
        </KeyboardAvoidingView>
      </Box>
    </SafeAreaView>
  );
}