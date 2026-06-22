import { router, useLocalSearchParams } from "expo-router";
import { Mail } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/src/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Heading } from "@/src/components/ui/heading";
import { HStack } from "@/src/components/ui/hstack";
import { Link, LinkText } from "@/src/components/ui/link";
import { Pressable } from "@/src/components/ui/pressable";
import { Text } from "@/src/components/ui/text";
import { VStack } from "@/src/components/ui/vstack";
import { useAuth } from "@/src/lib/auth-context";
import { MOCK_OTP_CODE, mockVerifyEmailOtp } from "@/src/lib/mock-auth";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export default function VerifyEmailScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const { institution, completeEmailVerification } = useAuth();
  const email = emailParam?.trim() || "student@tvet.edu.za";

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otpValue = useMemo(() => digits.join(""), [digits]);
  const canSubmit = otpValue.length === OTP_LENGTH && !isSubmitting;

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const updateDigit = useCallback((index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);

    setDigits((current) => {
      const next = [...current];
      next[index] = sanitized;
      return next;
    });
    setError(null);

    if (sanitized && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback(
    (index: number, key: string) => {
      if (key === "Backspace" && digits[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits],
  );

  const handlePaste = useCallback((value: string) => {
    const pasted = value.replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (!pasted) {
      return;
    }

    setDigits((current) => {
      const next = [...current];
      pasted.split("").forEach((char, index) => {
        next[index] = char;
      });
      return next;
    });
    setError(null);

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }, []);

  const handleResend = () => {
    if (countdown > 0) {
      return;
    }

    setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
    setCountdown(RESEND_SECONDS);
    setError(null);
    inputRefs.current[0]?.focus();
  };

  const handleVerify = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await mockVerifyEmailOtp(email, otpValue);

      if (!result.success) {
        setError(result.error);
        return;
      }

      completeEmailVerification();
      router.replace("/(tabs)/feed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 bg-background">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Box className="flex-1 items-center justify-center px-4 py-6">
            <Card className="w-full max-w-[420px] items-center gap-0 border border-border p-6 shadow-sm">
              <Box className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-accent">
                <Mail className="h-8 w-8 text-primary" />
              </Box>

              <Heading
                size="xl"
                className="mb-2 text-center font-bold text-foreground"
              >
                Verify your email
              </Heading>

              <Text className="mb-8 text-center text-base text-muted-foreground">
                We sent a 6-digit code to{"\n"}
                <Text className="text-sm font-semibold text-foreground">
                  {email}
                </Text>
              </Text>

              {institution ? (
                <Text className="-mt-6 mb-6 text-center text-xs font-medium text-primary">
                  {institution.name}
                </Text>
              ) : null}

              <VStack className="w-full items-center">
                <HStack className="mb-6 w-full justify-between gap-2">
                  {digits.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        inputRefs.current[index] = ref;
                      }}
                      value={digit}
                      onChangeText={(value) => {
                        if (value.length > 1) {
                          handlePaste(value);
                          return;
                        }

                        updateDigit(index, value);
                      }}
                      onKeyPress={({ nativeEvent }) =>
                        handleKeyPress(index, nativeEvent.key)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      autoFocus={index === 0}
                      className="h-14 w-10 rounded-lg border border-border bg-card text-center text-xl font-semibold text-foreground shadow-sm sm:h-16 sm:w-12"
                      selectTextOnFocus
                    />
                  ))}
                </HStack>

                <Text className="mb-8 text-sm text-muted-foreground">
                  {countdown > 0 ? (
                    <>
                      Resend code in{" "}
                      <Text className="text-sm font-semibold tabular-nums text-foreground">
                        {formatCountdown(countdown)}
                      </Text>
                    </>
                  ) : (
                    <Pressable onPress={handleResend}>
                      <Text className="text-sm font-semibold text-primary">
                        Resend code
                      </Text>
                    </Pressable>
                  )}
                </Text>

                {error ? (
                  <Text className="mb-4 text-sm text-destructive">{error}</Text>
                ) : null}

                <Button
                  variant="default"
                  size="lg"
                  isDisabled={!canSubmit}
                  onPress={handleVerify}
                  className="h-12 w-full rounded-lg"
                >
                  {isSubmitting ? <ButtonSpinner /> : null}
                  <ButtonText className="text-sm font-semibold">
                    Verify & Continue
                  </ButtonText>
                </Button>

                <Text className="mt-4 text-center text-xs text-muted-foreground">
                  Mock code: {MOCK_OTP_CODE}
                </Text>
              </VStack>

              <Link href="#" className="mt-4">
                <LinkText className="text-xs text-primary no-underline">
                  Having trouble? Get help
                </LinkText>
              </Link>
            </Card>
          </Box>
        </KeyboardAvoidingView>
      </Box>
    </SafeAreaView>
  );
}
