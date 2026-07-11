import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ArrowLeft, Pencil } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, AvatarImage } from "@/src/shared/components/ui/avatar";
import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/src/shared/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/shared/components/ui/form-control";
import { Heading } from "@/src/shared/components/ui/heading";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Input, InputField } from "@/src/shared/components/ui/input";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { ScreenStatusBar } from "@/src/shared/components/screen-status-bar";
import { ScrollView } from "@/src/shared/components/ui/scroll-view";
import { VStack } from "@/src/shared/components/ui/vstack";
import { selectCurrentUser } from "@/src/features/auth/store/authSelectors";
import {
  useProfileQuery,
  useUpdateMyProfile,
} from "@/src/features/profile/hooks/useProfile";
import type { ProfileImageInput } from "@/src/features/profile/api/profileApi";
import { useAppSelector } from "@/src/shared/store/hooks";

const PROFILE_AVATAR_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuABQZaAwedUgXA5VgbCkwYf_G84rE21w_hOJSspZrwsWSwJ74b0blOw41di6I6SRospLCEsde9WWJiWGJujyBdSmO6xgEb8SFI6tlHumbaacAGPYlS08iQDF1LEo14AT4vhBTm4iZauzKebPquhlW6omgL9NODXe_TodVLowJIW3DgONw5qrWlT3LkBUxOpFeVJAZzKCxygbHV8EME0TeEjJ2BPg_gOi-6JIEjynYCh9if22rHy6g1V1OVUTsko0BwwDPlwpjqJSlu2";

export default function EditProfileScreen() {
  const authUser = useAppSelector(selectCurrentUser);
  const { data: profile } = useProfileQuery();
  const user = profile ?? authUser;
  const updateMutation = useUpdateMyProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pendingImage, setPendingImage] = useState<ProfileImageInput | null>(
    null,
  );
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !user) return;
    initialized.current = true;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhoneNumber(user.phoneNumber ?? "");
  }, [user]);

  const avatarUri = pendingImage?.uri ?? user?.avatarUrl ?? PROFILE_AVATAR_URI;

  const hasChanges =
    firstName.trim() !== (user?.firstName ?? "") ||
    lastName.trim() !== (user?.lastName ?? "") ||
    phoneNumber.trim() !== (user?.phoneNumber ?? "") ||
    Boolean(pendingImage);

  const canSubmit =
    hasChanges &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    !updateMutation.isPending;

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    setPendingImage({
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
    });
  };

  const handleSave = () => {
    if (!canSubmit) return;

    updateMutation.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        image: pendingImage ?? undefined,
      },
      {
        onSuccess: () => router.back(),
      },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScreenStatusBar style="dark" backgroundColor="#ffffff" />
      <Box className="flex-1 bg-background">
        <HStack className="items-center justify-between border-b border-border bg-card px-4 py-2 shadow-sm">
          <Pressable
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full data-[active=true]:bg-muted"
          >
            <ArrowLeft className="h-5 w-5 text-primary" />
          </Pressable>

          <Heading
            size="md"
            isTruncated
            className="flex-1 px-4 text-center font-bold text-primary"
          >
            Edit Profile
          </Heading>

          <Box className="h-10 w-10" />
        </HStack>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-6 px-4 pb-8 pt-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <VStack className="items-center gap-4">
              <Box className="relative">
                <Avatar className="h-24 w-24 border-4 border-card shadow-sm">
                  <AvatarImage source={{ uri: avatarUri }} />
                </Avatar>
                <Pressable
                  onPress={handlePickAvatar}
                  className="absolute right-0 bottom-0 h-8 w-8 items-center justify-center rounded-full bg-primary data-[active=true]:opacity-90"
                >
                  <Pencil className="h-4 w-4 text-primary-foreground" />
                </Pressable>
              </Box>
            </VStack>

            <VStack className="gap-5">
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-sm font-semibold">
                    First name
                  </FormControlLabelText>
                </FormControlLabel>
                <Input className="h-12 rounded-lg border-border bg-card">
                  <InputField
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name"
                    accessibilityLabel="First name"
                    className="px-3 text-sm text-foreground"
                  />
                </Input>
              </FormControl>

              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-sm font-semibold">
                    Last name
                  </FormControlLabelText>
                </FormControlLabel>
                <Input className="h-12 rounded-lg border-border bg-card">
                  <InputField
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                    accessibilityLabel="Last name"
                    className="px-3 text-sm text-foreground"
                  />
                </Input>
              </FormControl>

              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-sm font-semibold">
                    Phone number
                  </FormControlLabelText>
                </FormControlLabel>
                <Input className="h-12 rounded-lg border-border bg-card">
                  <InputField
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Phone number"
                    keyboardType="phone-pad"
                    accessibilityLabel="Phone number"
                    className="px-3 text-sm text-foreground"
                  />
                </Input>
              </FormControl>

              <Button
                size="lg"
                isDisabled={!canSubmit}
                onPress={handleSave}
                className="mt-2 h-12 w-full rounded-xl bg-secondary data-[active=true]:bg-secondary/90"
              >
                {updateMutation.isPending ? (
                  <ButtonSpinner className="text-secondary-foreground" />
                ) : null}
                <ButtonText className="text-sm font-semibold text-secondary-foreground">
                  Save changes
                </ButtonText>
              </Button>
            </VStack>
          </ScrollView>
        </KeyboardAvoidingView>
      </Box>
    </SafeAreaView>
  );
}
