import { router } from "expo-router";
import {
  Check,
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/src/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { Heading } from "@/src/components/ui/heading";
import { HStack } from "@/src/components/ui/hstack";
import { Input, InputField, InputSlot } from "@/src/components/ui/input";
import { Pressable } from "@/src/components/ui/pressable";
import { ScrollView } from "@/src/components/ui/scroll-view";
import { Text } from "@/src/components/ui/text";
import { VStack } from "@/src/components/ui/vstack";
import { useAuth } from "@/src/lib/auth-context";
import { mockResetPassword } from "@/src/lib/mock-auth";
import {
  getMetRequirementCount,
  getPasswordStrength,
  isPasswordValid,
} from "@/src/lib/password-utils";

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
  const { institution } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    passwordValid && passwordsMatch && !isSubmitting && !isSuccess;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      await mockResetPassword(newPassword);
      setIsSuccess(true);

      setTimeout(() => {
        router.replace("/(tabs)/feed");
      }, 900);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 py-6 pb-8"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          showsVerticalScrollIndicator={false}
        >
          <Card className="w-full max-w-md gap-0 self-center overflow-hidden border border-border p-0 shadow-lg">
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
                      className="px-3 text-base text-foreground"
                    />
                    <InputSlot className="pr-2">
                      <Pressable
                        onPress={() =>
                          setShowNewPassword((current) => !current)
                        }
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

                <StrengthMeter metCount={metCount} />
                <Text className="text-xs text-muted-foreground">
                  Use at least 8 characters with uppercase, a number, and a
                  special character.
                </Text>

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
                      editable={newPassword.length > 0}
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
                  {isSuccess ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <RefreshCw className="h-5 w-5 text-primary-foreground" />
                  )}
                  <ButtonText
                    className={`text-sm font-semibold ${
                      isSuccess ? "text-white" : ""
                    }`}
                  >
                    {isSuccess ? "Password Updated" : "Update Password"}
                  </ButtonText>
                </Button>
              </Box>
            </Card>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
