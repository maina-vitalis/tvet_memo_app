import { router, useLocalSearchParams } from "expo-router";
import { Mail } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, TextInput } from "react-native";
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

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export default function VerifyEmailScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const { institution, sendEmailVerification, verifyEmailOtp } = useAuth();
  const email = emailParam?.trim() ?? "";

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otpValue = useMemo(() => digits.join(""), [digits]);
  const canSubmit =
    otpValue.length === OTP_LENGTH && !isSubmitting && email.length > 0;

  useEffect(() => {
    if (!institution) {
      router.replace("/(auth)/tenant-discovery");
    }
  }, [institution]);

  useEffect(() => {
    if (!institution || !email) {
      return;
    }

    let cancelled = false;

    const sendCode = async () => {
      setIsSendingCode(true);
      setError(null);

      try {
        await sendEmailVerification(email);
      } catch {
        if (!cancelled) {
          setError("Could not send verification code. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsSendingCode(false);
        }
      }
    };

    void sendCode();

    return () => {
      cancelled = true;
    };
  }, [email, institution, sendEmailVerification]);

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

  const handleResend = async () => {
    if (countdown > 0 || !email) {
      return;
    }

    setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
    setCountdown(RESEND_SECONDS);
    setError(null);
    inputRefs.current[0]?.focus();

    try {
      await sendEmailVerification(email);
    } catch {
      setError("Could not resend verification code. Please try again.");
    }
  };

  const handleVerify = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await verifyEmailOtp(email, otpValue);

      if (!result.success) {
        setError(result.error);
        return;
      }

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
            <Card className="w-full max-w-105 items-center gap-0 border border-border p-6 shadow-sm">
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
                  {isSendingCode
                    ? "Sending a 6-digit code to"
                    : "We sent a 6-digit code to"}
                  {"\n"}
                  <Text className="text-sm font-semibold text-foreground">
                    {email || "your email"}
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
