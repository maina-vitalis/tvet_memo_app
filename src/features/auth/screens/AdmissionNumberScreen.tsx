import { router } from "expo-router";
import { IdCard, Landmark } from "lucide-react-native";
import { useEffect, useState } from "react";

import {
  AuthFormCard,
  AuthScreenShell,
} from "@/src/features/auth/components/AuthScreenShell";
import { AUTH_ROUTES } from "@/src/features/auth/navigation";
import { selectInstitution } from "@/src/features/auth/store/authSelectors";
import { setPendingAdmissionNumber } from "@/src/features/auth/store/authSlice";
import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonText } from "@/src/shared/components/ui/button";
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

  const handleBack = () => {
    router.replace(AUTH_ROUTES.tenantDiscovery);
  };

  const handleChangeInstitution = () => {
    router.replace(AUTH_ROUTES.tenantDiscovery);
  };

  return (
    <AuthScreenShell onBack={handleBack} contentClassName="justify-center">
      <AuthFormCard>
        <VStack className="mb-6 items-center gap-3">
          <Box className="h-16 w-16 items-center justify-center rounded-2xl bg-accent">
            <Landmark className="h-8 w-8 text-primary" />
          </Box>

          <Heading size="lg" className="text-center font-bold text-primary">
            {institution.name}
          </Heading>

          <HStack className="items-center gap-1">
            <Text className="text-sm text-muted-foreground">
              Not your institution?
            </Text>
            <Pressable onPress={handleChangeInstitution}>
              <Text className="text-sm font-semibold text-primary">Change</Text>
            </Pressable>
          </HStack>
        </VStack>

        <VStack className="gap-4">
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText className="text-sm font-semibold">
                Admission number
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="h-12">
              <InputSlot className="pl-1">
                <IdCard className="h-5 w-5 text-primary" />
              </InputSlot>
              <InputField
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="e.g. NTI/2023/1234"
                value={admissionNumber}
                onChangeText={setAdmissionNumber}
                accessibilityLabel="Admission number"
                className="px-2 text-base text-foreground"
              />
            </Input>
            <Text className="mt-2 text-xs text-muted-foreground">
              Enter the admission number provided by your institution.
            </Text>
          </FormControl>

          <Button
            size="lg"
            isDisabled={!canContinue}
            onPress={handleContinue}
            className="h-12 rounded-xl bg-primary"
          >
            <ButtonText className="text-sm font-semibold">Continue</ButtonText>
          </Button>
        </VStack>
      </AuthFormCard>
    </AuthScreenShell>
  );
}
