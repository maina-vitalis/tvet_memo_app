import { router } from "expo-router";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  HelpCircle,
  Landmark,
  Lock,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Box } from "@/src/shared/components/ui/box";
import {
  Button,
  ButtonSpinner,
  ButtonText,
} from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/shared/components/ui/form-control";
import { Heading } from "@/src/shared/components/ui/heading";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Input, InputField, InputSlot } from "@/src/shared/components/ui/input";
import { Link, LinkText } from "@/src/shared/components/ui/link";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { FormErrorMessage } from "@/src/shared/components/form-error-message";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import {
  AUTH_ROUTES,
  resolvePostAuthRoute,
} from "@/src/features/auth/navigation";
import {
  selectInstitution,
  selectPendingAdmissionNumber,
} from "@/src/features/auth/store/authSelectors";
import { useAppSelector } from "@/src/shared/store/hooks";

export default function RegistryLoginScreen() {
  const { signIn, clearInstitution } = useAuth();
  const institution = useAppSelector(selectInstitution);
  const pendingAdmissionNumber = useAppSelector(selectPendingAdmissionNumber);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!institution) {
      router.replace(AUTH_ROUTES.tenantDiscovery);
      return;
    }

    if (!pendingAdmissionNumber) {
      router.replace(AUTH_ROUTES.admissionNumber);
    }
  }, [institution, pendingAdmissionNumber]);

  if (!institution || !pendingAdmissionNumber) {
    return null;
  }

  const canSubmit = password.length > 0 && !isSubmitting;

  const handleSignIn = async () => {
    if (!canSubmit) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const result = await signIn(pendingAdmissionNumber, password);
    setIsSubmitting(false);

    if (result.success) {
      router.replace(resolvePostAuthRoute(result.mustResetPassword));
      return;
    }

    setError(result.error);
  };

  const handleChangeInstitution = () => {
    clearInstitution();
    router.replace(AUTH_ROUTES.tenantDiscovery);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 bg-background">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Box className="flex-1 items-center justify-center px-4">
            <Pressable
              onPress={() => router.replace(AUTH_ROUTES.admissionNumber)}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="absolute left-4 top-4 h-10 w-10 items-center justify-center rounded-full data-[active=true]:bg-muted"
            >
              <ChevronLeft className="h-6 w-6 text-primary" />
            </Pressable>

            <Card className="w-full max-w-md gap-0 border-0 p-6 shadow-sm">
              <VStack className="mb-8 items-center">
                <Box className="mb-4 h-16 w-16 items-center justify-center rounded-full border border-border bg-muted">
                  <Landmark className="h-8 w-8 text-primary" />
                </Box>

                <Heading
                  size="xl"
                  className="mb-1 text-center font-bold text-primary"
                >
                  {institution.name}
                </Heading>

                <Text className="text-center text-sm text-muted-foreground">
                  Admission number: {pendingAdmissionNumber}
                </Text>

                <HStack className="mt-2 items-center gap-1">
                  <Text className="text-sm text-muted-foreground">
                    Not your institution?
                  </Text>
                  <Pressable onPress={handleChangeInstitution}>
                    <Text className="text-sm font-semibold text-primary">
                      Change
                    </Text>
                  </Pressable>
                </HStack>
              </VStack>

              <VStack className="gap-4">
                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-semibold">
                      Password
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-11 rounded-xl border-border bg-card data-[focus=true]:border-primary">
                    <InputSlot className="pl-3">
                      <Lock className="h-4.5 w-4.5 text-muted-foreground" />
                    </InputSlot>
                    <InputField
                      secureTextEntry={!showPassword}
                      placeholder="Enter password"
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        setError(null);
                      }}
                      accessibilityLabel="Password"
                      className="px-2 text-sm text-foreground"
                    />
                    <InputSlot className="pr-2">
                      <Pressable
                        onPress={() => setShowPassword((current) => !current)}
                        className="h-8 w-8 items-center justify-center rounded-md data-[active=true]:bg-muted"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4.5 w-4.5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4.5 w-4.5 text-muted-foreground" />
                        )}
                      </Pressable>
                    </InputSlot>
                  </Input>
                  <Text className="mt-2 text-xs italic text-muted-foreground">
                    Default: your admission number
                  </Text>
                </FormControl>

                <FormErrorMessage message={error} />

                <Button
                  variant="default"
                  size="lg"
                  isDisabled={!canSubmit}
                  onPress={handleSignIn}
                  className="mt-1 rounded-xl shadow-sm active:scale-[0.98]"
                >
                  {isSubmitting ? <ButtonSpinner /> : null}
                  <ButtonText className="text-sm font-semibold">
                    Sign In
                  </ButtonText>
                </Button>
              </VStack>

              <Box className="mt-6 border-t border-border pt-4">
                <Link href="#" className="items-center justify-center">
                  <HStack className="items-center gap-1">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <LinkText
                      className="text-sm text-muted-foreground no-underline"
                      underline={false}
                    >
                      Forgot password? Contact your registry office.
                    </LinkText>
                  </HStack>
                </Link>
              </Box>
            </Card>
          </Box>
        </KeyboardAvoidingView>
      </Box>
    </SafeAreaView>
  );
}
