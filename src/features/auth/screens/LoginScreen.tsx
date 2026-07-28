import { router, useLocalSearchParams } from "expo-router";
import { Mail } from "lucide-react-native";
import { useEffect, useState } from "react";

import {
  AuthBrandHeader,
  AuthFormCard,
  AuthScreenShell,
} from "@/src/features/auth/components/AuthScreenShell";
import { useCheckEmail } from "@/src/features/auth/hooks/useAuthMutations";
import { AUTH_ROUTES } from "@/src/features/auth/navigation";
import { selectInstitution } from "@/src/features/auth/store/authSelectors";
import {
  Button,
  ButtonSpinner,
  ButtonText,
} from "@/src/shared/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/shared/components/ui/form-control";
import { Image } from "@/src/shared/components/ui/image";
import { Input, InputField, InputSlot } from "@/src/shared/components/ui/input";
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
    <AuthScreenShell
      onBack={handleBack}
      title="Sign in or create an account"
      subtitle="Enter your institutional email to sign in or register"
      institutionName={institution.name}
      header={
        <AuthBrandHeader
          logo={
            <Image
              source={APP_LOGO}
              size="md"
              className="h-16 w-16"
              accessibilityLabel="TVET MEMO logo"
            />
          }
        />
      }
    >
      <AuthFormCard>
        <VStack className="gap-5">
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText className="text-sm font-semibold">
                Email address
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="h-12">
              <InputSlot className="pl-1">
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
                className="px-2 text-base text-foreground"
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
      </AuthFormCard>
    </AuthScreenShell>
  );
}
