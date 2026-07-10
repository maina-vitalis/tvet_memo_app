import { router } from "expo-router";
import { ChevronLeft, IdCard, Landmark } from "lucide-react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AUTH_ROUTES } from "@/src/features/auth/navigation";
import { setPendingAdmissionNumber } from "@/src/features/auth/store/authSlice";
import { selectInstitution } from "@/src/features/auth/store/authSelectors";
import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonText } from "@/src/shared/components/ui/button";
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
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import { useAppDispatch, useAppSelector } from "@/src/shared/store/hooks";

export default function AdmissionNumberScreen() {
  const dispatch = useAppDispatch();
  const institution = useAppSelector(selectInstitution);
  const [admissionNumber, setAdmissionNumber] = useState("");

  useEffect(() => {
    if (!institution) {
      router.replace(AUTH_ROUTES.tenantDiscovery);
    }
  }, [institution]);

  if (!institution) {
    return null;
  }

  const canContinue = admissionNumber.trim().length > 0;

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    dispatch(setPendingAdmissionNumber(admissionNumber.trim()));
    router.push(AUTH_ROUTES.loginRegistry);
  };

  const handleChangeInstitution = () => {
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
              onPress={() => router.replace(AUTH_ROUTES.tenantDiscovery)}
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
                      accessibilityLabel="Admission number"
                      className="px-2 text-sm text-foreground"
                    />
                  </Input>
                  <Text className="mt-2 text-xs text-muted-foreground">
                    Enter the admission number provided by your institution.
                  </Text>
                </FormControl>

                <Button
                  variant="default"
                  size="lg"
                  isDisabled={!canContinue}
                  onPress={handleContinue}
                  className="mt-1 rounded-lg shadow-sm"
                >
                  <ButtonText className="text-sm font-semibold">
                    Continue
                  </ButtonText>
                </Button>
              </VStack>
            </Card>
          </Box>
        </KeyboardAvoidingView>
      </Box>
    </SafeAreaView>
  );
}
