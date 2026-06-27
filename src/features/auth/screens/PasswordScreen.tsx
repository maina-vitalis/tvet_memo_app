import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PasswordInput } from "@/src/features/auth/components/PasswordInput";
import {
  useLogin,
  useSetPassword,
} from "@/src/features/auth/hooks/useAuthMutations";
import { AUTH_ROUTE_PATHS, AUTH_ROUTES } from "@/src/features/auth/navigation";
import {
  selectInstitution,
  selectIsFirstSetup,
  selectPendingEmail,
  selectVerifiedOtp,
} from "@/src/features/auth/store/authSelectors";
import { isPasswordValid } from "@/src/features/auth/hooks/usePasswordStrength";
import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/src/shared/components/ui/button";
import { Heading } from "@/src/shared/components/ui/heading";
import { Image } from "@/src/shared/components/ui/image";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { ScrollView } from "@/src/shared/components/ui/scroll-view";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import { useAppSelector } from "@/src/shared/store/hooks";

const APP_LOGO = require("@/src/assets/images/splash-icon.png");

type PasswordMode = "setup" | "login";

export default function PasswordScreen() {
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const mode: PasswordMode = modeParam === "login" ? "login" : "setup";

  const institution = useAppSelector(selectInstitution);
  const isFirstSetup = useAppSelector(selectIsFirstSetup);
  const pendingEmail = useAppSelector(selectPendingEmail);
  const verifiedOtp = useAppSelector(selectVerifiedOtp);

  const {
    setPassword,
    isPending: isSettingPassword,
    error: setupError,
    resetError: resetSetupError,
  } = useSetPassword();
  const {
    login,
    isPending: isLoggingIn,
    error: loginError,
    resetError: resetLoginError,
  } = useLogin();

  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const isSetupMode = mode === "setup";
  const isSubmitting = isSettingPassword || isLoggingIn;
  const error = setupError ?? loginError ?? confirmError;

  useEffect(() => {
    if (!institution) {
      router.replace(AUTH_ROUTES.tenantDiscovery);
      return;
    }

    if (!pendingEmail) {
      router.replace(AUTH_ROUTES.login);
      return;
    }

    if (isSetupMode && !verifiedOtp) {
      router.replace({
        pathname: AUTH_ROUTE_PATHS.verifyEmail,
        params: { email: pendingEmail },
      });
    }
  }, [institution, pendingEmail, verifiedOtp, isSetupMode]);

  const passwordError =
    password.length > 0 && !isPasswordValid(password)
      ? "Use 8+ characters with uppercase, a number, and a special character."
      : null;

  const canSubmit = isSetupMode
    ? isPasswordValid(password) &&
      confirmPassword === password &&
      !isSubmitting
    : password.length > 0 && !isSubmitting;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(AUTH_ROUTES.login);
  };

  const handleSubmit = () => {
    if (!canSubmit || !pendingEmail) {
      return;
    }

    resetSetupError();
    resetLoginError();
    setConfirmError(null);

    if (isSetupMode) {
      if (confirmPassword !== password) {
        setConfirmError("Passwords do not match.");
        return;
      }

      setPassword({ email: pendingEmail, password });
      return;
    }

    login({ email: pendingEmail, password });
  };

  if (!institution || !pendingEmail) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 bg-background">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow px-4 pb-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
                {isSetupMode || isFirstSetup
                  ? "Set your password"
                  : "Enter your password"}
              </Heading>

              {isSetupMode ? (
                <Text className="text-base text-muted-foreground">
                  Choose a strong password to secure your account
                </Text>
              ) : null}
            </VStack>

            <VStack className="mt-8 gap-5">
              <PasswordInput
                value={password}
                onChangeText={(value) => {
                  setPasswordValue(value);
                  resetSetupError();
                  resetLoginError();
                }}
                placeholder="Password"
                label="Password"
                accessibilityLabel="Password"
                showStrengthBar={isSetupMode}
                error={passwordError}
              />

              {isSetupMode ? (
                <PasswordInput
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    setConfirmError(null);
                  }}
                  placeholder="Confirm password"
                  label="Confirm password"
                  accessibilityLabel="Confirm password"
                  error={
                    confirmPassword.length > 0 && confirmPassword !== password
                      ? "Passwords do not match."
                      : null
                  }
                />
              ) : null}

              {error ? (
                <Text className="text-sm text-destructive">{error}</Text>
              ) : null}

              <Button
                size="lg"
                isDisabled={!canSubmit}
                onPress={handleSubmit}
                className="mt-2 h-12 w-full rounded-xl bg-secondary data-[active=true]:bg-secondary/90"
              >
                {isSubmitting ? (
                  <ButtonSpinner className="text-secondary-foreground" />
                ) : null}
                <ButtonText className="text-sm font-semibold text-secondary-foreground">
                  Continue
                </ButtonText>
              </Button>
            </VStack>
          </ScrollView>
        </KeyboardAvoidingView>
      </Box>
    </SafeAreaView>
  );
}