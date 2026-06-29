import { router } from "expo-router";
import { ChevronLeft, Mail } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useSendOtp,
  useVerifyOtp,
} from "@/src/features/auth/hooks/useAuthMutations";
import { AUTH_ROUTE_PATHS, AUTH_ROUTES } from "@/src/features/auth/navigation";
import {
  selectInstitution,
  selectOtpSentAt,
  selectPendingEmail,
} from "@/src/features/auth/store/authSelectors";
import { Box } from "@/src/shared/components/ui/box";
import {
  Button,
  ButtonSpinner,
  ButtonText,
} from "@/src/shared/components/ui/button";
import { Heading } from "@/src/shared/components/ui/heading";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Image } from "@/src/shared/components/ui/image";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import { useAppSelector } from "@/src/shared/store/hooks";

const APP_LOGO = require("@/src/assets/images/splash-icon.png");
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export default function OtpScreen() {
  const institution = useAppSelector(selectInstitution);
  const pendingEmail = useAppSelector(selectPendingEmail);
  const otpSentAt = useAppSelector(selectOtpSentAt);
  const {
    sendOtp,
    sendOtpAsync,
    isPending: isSendingCode,
    error: sendError,
  } = useSendOtp();
  const {
    verifyOtp,
    isPending: isVerifying,
    error: verifyError,
    resetError: resetVerifyError,
  } = useVerifyOtp();

  const email = pendingEmail ?? "";
  const error = verifyError ?? sendError;

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const hasAttemptedInitialSend = useRef(false);

  const otpValue = useMemo(() => digits.join(""), [digits]);
  const canSubmit =
    otpValue.length === OTP_LENGTH && !isVerifying && email.length > 0;

  useEffect(() => {
    if (!institution) {
      router.replace(AUTH_ROUTES.tenantDiscovery);
      return;
    }

    if (!email) {
      router.replace(AUTH_ROUTES.tenantDiscovery);
    }
  }, [institution, email]);

  useEffect(() => {
    if (
      !institution ||
      !email ||
      otpSentAt !== null ||
      hasAttemptedInitialSend.current
    ) {
      return;
    }

    hasAttemptedInitialSend.current = true;
    sendOtp(email);
  }, [email, institution, otpSentAt, sendOtp]);

  useEffect(() => {
    if (otpSentAt === null) {
      return;
    }

    const elapsedSeconds = Math.floor((Date.now() - otpSentAt) / 1000);
    const remaining = Math.max(RESEND_SECONDS - elapsedSeconds, 0);
    setCountdown(remaining);
  }, [otpSentAt]);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const updateDigit = useCallback(
    (index: number, value: string) => {
      const sanitized = value.replace(/\D/g, "").slice(-1);

      setDigits((current) => {
        const next = [...current];
        next[index] = sanitized;
        return next;
      });
      resetVerifyError();

      if (sanitized && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [resetVerifyError],
  );

  const handleKeyPress = useCallback(
    (index: number, key: string) => {
      if (key === "Backspace" && digits[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits],
  );

  const handlePaste = useCallback(
    (value: string) => {
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
      resetVerifyError();

      const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
    },
    [resetVerifyError],
  );

  const handleResend = async () => {
    if (countdown > 0 || !email) {
      return;
    }

    setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
    inputRefs.current[0]?.focus();

    try {
      await sendOtpAsync(email);
      setCountdown(RESEND_SECONDS);
    } catch {
      // Error toast handled by mutation hook.
    }
  };

  const handleVerify = () => {
    if (!canSubmit) {
      return;
    }

    verifyOtp({ email, otp: otpValue });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.push({
      pathname: AUTH_ROUTE_PATHS.password,
      params: { mode: "setup" },
    });
  };

  if (!institution || !email) {
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
              <Text className="text-lg font-bold text-primary">
                TVET Connect
              </Text>
            </VStack>

            <VStack className="mt-8 items-center gap-2">
              <Box className="mb-2 h-14 w-14 items-center justify-center rounded-full bg-accent">
                <Mail className="h-7 w-7 text-primary" />
              </Box>

              <Heading
                size="xl"
                className="text-center font-bold text-foreground"
              >
                Verify your email
              </Heading>

              <Text className="text-center text-base text-muted-foreground">
                {isSendingCode
                  ? "Sending a 6-digit code..."
                  : "OTP sent to your email"}
              </Text>

              <Text className="text-center text-sm font-semibold text-foreground">
                {email}
              </Text>

              <Text className="text-center text-xs font-medium text-primary">
                {institution.name}
              </Text>
            </VStack>

            <VStack className="mt-8 w-full items-center">
              <HStack className="mb-6 w-full max-w-sm justify-between gap-2">
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
                    accessibilityLabel={`OTP digit ${index + 1}`}
                    className="h-14 w-10 rounded-lg border border-border bg-card text-center text-xl font-semibold text-foreground shadow-sm sm:h-16 sm:w-12"
                    selectTextOnFocus
                  />
                ))}
              </HStack>

              <Text className="mb-8 text-sm text-muted-foreground">
                {countdown > 0 ? (
                  <>
                    Resend OTP in{" "}
                    <Text className="text-sm font-semibold tabular-nums text-foreground">
                      {formatCountdown(countdown)}
                    </Text>
                  </>
                ) : (
                  <Pressable onPress={handleResend}>
                    <Text className="text-sm font-semibold text-primary">
                      Resend OTP
                    </Text>
                  </Pressable>
                )}
              </Text>

              {error ? (
                <Text className="mb-4 text-sm text-destructive">{error}</Text>
              ) : null}

              <Button
                size="lg"
                isDisabled={!canSubmit}
                onPress={handleVerify}
                className="h-12 w-full max-w-sm rounded-xl bg-secondary data-[active=true]:bg-secondary/90"
              >
                {isVerifying ? (
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
