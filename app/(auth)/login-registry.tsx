import { router } from "expo-router";
import {
  Eye,
  EyeOff,
  HelpCircle,
  IdCard,
  Landmark,
  Lock,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
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
import { Link, LinkText } from "@/src/components/ui/link";
import { Pressable } from "@/src/components/ui/pressable";
import { Text } from "@/src/components/ui/text";
import { VStack } from "@/src/components/ui/vstack";
import { useAuth } from "@/src/lib/auth-context";
import { MOCK_CREDENTIALS } from "@/src/lib/mock-auth";

export default function LoginRegistryScreen() {
  const { institution, signIn, clearInstitution } = useAuth();
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!institution) {
      router.replace("/(auth)/tenant-discovery");
    }
  }, [institution]);

  if (!institution) {
    return null;
  }

  const canSubmit =
    admissionNumber.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSignIn = async () => {
    if (!canSubmit) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const result = await signIn(admissionNumber, password);
    setIsSubmitting(false);

    if (result.success) {
      if (result.mustResetPassword) {
        router.replace("/(auth)/reset-password");
        return;
      }

      router.replace("/(tabs)/feed");
      return;
    }

    setError(result.error);
  };

  const handleChangeInstitution = () => {
    clearInstitution();
    router.replace("/(auth)/tenant-discovery");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box className="flex-1 bg-background">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Box className="flex-1 items-center justify-center px-4">
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

                <HStack className="items-center gap-1">
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
                      Admission Number
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-11 rounded-lg border-border bg-card data-[focus=true]:border-primary">
                    <InputSlot className="pl-3">
                      <IdCard className="h-4.5 w-4.5 text-muted-foreground" />
                    </InputSlot>
                    <InputField
                      autoCapitalize="characters"
                      autoCorrect={false}
                      placeholder="e.g. NTI/2023/1234"
                      value={admissionNumber}
                      onChangeText={setAdmissionNumber}
                      className="px-2 text-sm text-foreground"
                    />
                  </Input>
                </FormControl>

                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-semibold">
                      Password
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-11 rounded-lg border-border bg-card data-[focus=true]:border-primary">
                    <InputSlot className="pl-3">
                      <Lock className="h-4.5 w-4.5 text-muted-foreground" />
                    </InputSlot>
                    <InputField
                      secureTextEntry={!showPassword}
                      placeholder="Enter password"
                      value={password}
                      onChangeText={setPassword}
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
                    Default: your ID number
                  </Text>
                </FormControl>

                {error ? (
                  <Text className="text-sm text-destructive">{error}</Text>
                ) : null}

                <Button
                  variant="default"
                  size="lg"
                  isDisabled={!canSubmit}
                  onPress={handleSignIn}
                  className="mt-1 rounded-lg shadow-sm active:scale-[0.98]"
                >
                  {isSubmitting ? <ButtonSpinner /> : null}
                  <ButtonText className="text-sm font-semibold">
                    Sign In
                  </ButtonText>
                </Button>

                <Text className="text-center text-xs text-muted-foreground">
                  Mock login: {MOCK_CREDENTIALS.admissionNumber} /{" "}
                  {MOCK_CREDENTIALS.password}
                </Text>
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
