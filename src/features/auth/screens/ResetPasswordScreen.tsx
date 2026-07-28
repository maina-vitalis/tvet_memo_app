import { router } from "expo-router";
import { Eye, EyeOff, Lock } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/shared/components/ui/form-control";
import { Heading } from "@/src/shared/components/ui/heading";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Input, InputField, InputSlot } from "@/src/shared/components/ui/input";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { ScrollView } from "@/src/shared/components/ui/scroll-view";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import { useKeyboardHeight } from "@/src/shared/hooks/use-keyboard-height";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { AUTH_ROUTES } from "@/src/features/auth/navigation";
import { selectPendingPassword } from "@/src/features/auth/store/authSelectors";
import { useAppSelector } from "@/src/shared/store/hooks";
import {
  getMetRequirementCount,
  getPasswordStrength,
  isPasswordValid,
} from "@/src/shared/utils/password-utils";

const STRENGTH_LABELS = {
  weak: "Strength: Weak",
  fair: "Strength: Fair",
  good: "Strength: Good",
  strong: "Strength: Strong",
} as const;

function StrengthMeter({ metCount }: { metCount: number }) {
  const strength = getPasswordStrength(metCount);

  const segmentColors = Array.from({ length: 4 }, (_, index) => {
    if (metCount === 0) {
      return "bg-muted";
    }

    if (strength === "fair") {
      return index < metCount ? "bg-destructive" : "bg-muted";
    }

    if (strength === "good") {
      return index < 3 ? "bg-secondary" : "bg-muted";
    }

    if (strength === "strong") {
      return "bg-emerald-500";
    }

    return "bg-muted";
  });

  return (
    <VStack className="gap-1">
      <Text className="text-[11px] text-muted-foreground">
        {STRENGTH_LABELS[strength]}
      </Text>
      <HStack className="h-2 gap-1 overflow-hidden rounded-full">
        {segmentColors.map((color, index) => (
          <Box key={index} className={`h-full flex-1 rounded-full ${color}`} />
        ))}
      </HStack>
    </VStack>
  );
}

export default function ResetPasswordScreen() {
  const { institution, changePassword, isAuthenticated } = useAuth();
  const pendingPassword = useAppSelector(selectPendingPassword);
  const { isKeyboardVisible } = useKeyboardHeight();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registry sign-in hands over the password it just used; email, OTP and
  // setup-link flows do not, so those users have to type it here.
  const needsCurrentPassword = !pendingPassword;

  const metCount = useMemo(
    () => getMetRequirementCount(newPassword),
    [newPassword],
  );
  const passwordValid = isPasswordValid(newPassword);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const showMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    passwordValid &&
    passwordsMatch &&
    (!needsCurrentPassword || currentPassword.length > 0) &&
    !isSubmitting &&
    !isSuccess;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(AUTH_ROUTES.tenantDiscovery);
    }
  }, [isAuthenticated]);

  const scrollContentStyle = useMemo(
    () => ({
      flexGrow: 1,
      justifyContent: isKeyboardVisible ? ("flex-start" as const) : ("center" as const),
      paddingTop: isKeyboardVisible ? 16 : undefined,
      paddingBottom: 32,
    }),
    [isKeyboardVisible],
  );

  const scrollConfirmIntoView = useCallback(() => {
    const delay = Platform.OS === "ios" ? 300 : 100;

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, delay);
  }, []);

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await changePassword(
        newPassword,
        needsCurrentPassword ? currentPassword : undefined,
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsSuccess(true);

      setTimeout(() => {
        router.replace(AUTH_ROUTES.home);
      }, 900);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 bg-background">
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="items-center px-4 py-6"
          contentContainerStyle={scrollContentStyle}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <Card className="w-full max-w-md gap-0 overflow-hidden border border-border p-0 shadow-lg">
            <VStack className="items-center border-b border-border px-6 pb-4 pt-6">
              <Box className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-accent">
                <Lock className="h-8 w-8 text-primary" />
              </Box>
              <Heading
                size="xl"
                className="mb-1 text-center font-bold text-foreground"
              >
                Update Your Password
              </Heading>
              <Text className="text-center text-sm text-muted-foreground">
                For your security, you must set a new password before
                continuing.
              </Text>
              {institution ? (
                <Text className="mt-2 text-center text-xs font-medium text-primary">
                  {institution.name}
                </Text>
              ) : null}
            </VStack>

            <VStack className="gap-5 px-6 py-6">
              {needsCurrentPassword ? (
                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-semibold">
                      Current Password
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-12 rounded-lg border-border bg-card data-[focus=true]:border-primary">
                    <InputField
                      secureTextEntry={!showCurrentPassword}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      accessibilityLabel="Current password"
                      className="px-3 text-base text-foreground"
                    />
                    <InputSlot className="pr-2">
                      <Pressable
                        onPress={() =>
                          setShowCurrentPassword((current) => !current)
                        }
                        className="h-8 w-8 items-center justify-center rounded-md data-[active=true]:bg-muted"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4.5 w-4.5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4.5 w-4.5 text-muted-foreground" />
                        )}
                      </Pressable>
                    </InputSlot>
                  </Input>
                </FormControl>
              ) : null}

              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-sm font-semibold">
                    New Password
                  </FormControlLabelText>
                </FormControlLabel>
                <Input className="h-12 rounded-lg border-border bg-card data-[focus=true]:border-primary">
                  <InputField
                    secureTextEntry={!showNewPassword}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    accessibilityLabel="New password"
                    className="px-3 text-base text-foreground"
                  />
                  <InputSlot className="pr-2">
                    <Pressable
                      onPress={() => setShowNewPassword((current) => !current)}
                      className="h-8 w-8 items-center justify-center rounded-md data-[active=true]:bg-muted"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4.5 w-4.5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4.5 w-4.5 text-muted-foreground" />
                      )}
                    </Pressable>
                  </InputSlot>
                </Input>
              </FormControl>

              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-sm font-semibold">
                    Confirm Password
                  </FormControlLabelText>
                </FormControlLabel>
                <Input
                  isDisabled={newPassword.length === 0}
                  className={`h-12 rounded-lg border-border bg-card data-[focus=true]:border-primary ${
                    showMismatch ? "border-destructive" : ""
                  }`}
                >
                  <InputField
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={scrollConfirmIntoView}
                    editable={newPassword.length > 0}
                    accessibilityLabel="Confirm new password"
                    className="px-3 text-base text-foreground"
                  />
                  <InputSlot className="pr-2">
                    <Pressable
                      onPress={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      disabled={newPassword.length === 0}
                      className="h-8 w-8 items-center justify-center rounded-md data-[active=true]:bg-muted"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4.5 w-4.5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4.5 w-4.5 text-muted-foreground" />
                      )}
                    </Pressable>
                  </InputSlot>
                </Input>
                {showMismatch ? (
                  <Text className="mt-1 text-[11px] text-destructive">
                    Passwords do not match.
                  </Text>
                ) : null}
              </FormControl>
            </VStack>

            <Box className="border-t border-border bg-background px-6 pb-6 pt-4">
              <VStack className="gap-4">
                <VStack className="gap-4">
                  <StrengthMeter metCount={metCount} />
                  <Text className="text-xs text-muted-foreground">
                    Use at least 8 characters with uppercase, a number, and a
                    special character.
                  </Text>
                </VStack>

                {error ? (
                  <Text className="text-sm text-destructive">{error}</Text>
                ) : null}

                <Button
                  variant={isSuccess ? "secondary" : "default"}
                  size="lg"
                  isDisabled={!canSubmit}
                  onPress={handleSubmit}
                  className={`w-full rounded-lg shadow-sm ${
                    isSuccess ? "bg-emerald-500" : ""
                  }`}
                >
                  {isSubmitting ? <ButtonSpinner /> : null}
                  <ButtonText
                    className={`text-sm font-semibold ${
                      isSuccess ? "text-white" : ""
                    }`}
                  >
                    {isSuccess ? "Password Updated" : "Update Password"}
                  </ButtonText>
                </Button>
              </VStack>
            </Box>
          </Card>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}