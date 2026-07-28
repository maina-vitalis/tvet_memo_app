import { router } from "expo-router";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { MemoAudienceFields } from "@/src/features/memos/components/MemoAudienceFields";
import type { LocalMemoAttachment } from "@/src/features/memos/components/MemoAttachmentPicker";
import { MemoAttachmentPicker } from "@/src/features/memos/components/MemoAttachmentPicker";
import { isRichTextEmpty } from "@/src/features/memos/components/MemoBodyContent";
import { MemoRichTextEditor } from "@/src/features/memos/components/MemoRichTextEditor";
import { useMemoComposer } from "@/src/features/memos/hooks/useMemoComposer";
import { useCanBroadcastMemo } from "@/src/features/memos/hooks/useMemoPermissions";
import { useActorRole } from "@/src/features/memos/hooks/useMemoTargeting";
import type {
  MemoCategory,
  MemoPriority,
} from "@/src/features/memos/types/CreateMemoTypes";
import {
  buildMemoTargetPayload,
  isAudienceSelectionValid,
  type MemoAudienceSelection,
} from "@/src/features/memos/utils/buildMemoTargetPayload";
import { ScreenStatusBar } from "@/src/shared/components/screen-status-bar";
import { Box } from "@/src/shared/components/ui/box";
import {
  Button,
  ButtonSpinner,
  ButtonText,
} from "@/src/shared/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/shared/components/ui/form-control";
import { Heading } from "@/src/shared/components/ui/heading";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Input, InputField } from "@/src/shared/components/ui/input";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { ScrollView } from "@/src/shared/components/ui/scroll-view";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/src/shared/components/ui/select";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";

const CATEGORY_OPTIONS: { label: string; value: MemoCategory }[] = [
  { label: "General", value: "general" },
  { label: "Academic", value: "academic" },
  { label: "Administrative", value: "administrative" },
  { label: "Emergency", value: "emergency" },
  { label: "Event", value: "event" },
];

const PRIORITY_OPTIONS: { label: string; value: MemoPriority }[] = [
  { label: "Low", value: "low" },
  { label: "Normal", value: "normal" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

function getOptionLabel<T extends string>(
  options: { label: string; value: T }[],
  value: T,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

const DEFAULT_AUDIENCE: MemoAudienceSelection = {
  targetType: "broadcast",
  selectedRoles: [],
  selectedDepartmentIds: [],
  selectedUserIds: [],
};

export default function CreateMemoScreen() {
  const insets = useSafeAreaInsets();
  const canBroadcastMemo = useCanBroadcastMemo();
  const actorRole = useActorRole();
  const composer = useMemoComposer();

  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [attachments, setAttachments] = useState<LocalMemoAttachment[]>([]);
  const [category, setCategory] = useState<MemoCategory>("general");
  const [priority, setPriority] = useState<MemoPriority>("normal");
  const [audience, setAudience] =
    useState<MemoAudienceSelection>(DEFAULT_AUDIENCE);
  const [userSearch, setUserSearch] = useState("");

  const trimmedSubject = subject.trim();
  const hasBody = !isRichTextEmpty(bodyHtml);

  const isFormValid = useMemo(() => {
    if (!actorRole || trimmedSubject.length === 0 || !hasBody) {
      return false;
    }

    return isAudienceSelectionValid(actorRole, audience);
  }, [actorRole, audience, hasBody, trimmedSubject.length]);

  if (!canBroadcastMemo) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenStatusBar style="dark" backgroundColor="#ffffff" />
        <Box className="flex-1 items-center justify-center bg-background px-6">
          <Text className="text-center text-muted-foreground">
            You do not have permission to create memos.
          </Text>
          <Button
            variant="outline"
            className="mt-4"
            onPress={() => router.back()}
          >
            <ButtonText>Go back</ButtonText>
          </Button>
        </Box>
      </SafeAreaView>
    );
  }

  const buildPayload = () => {
    if (!actorRole) {
      return null;
    }

    const { targetType, targetPayload } = buildMemoTargetPayload(
      actorRole,
      audience,
    );

    return {
      subject: trimmedSubject,
      body: bodyHtml,
      bodyFormat: "html" as const,
      category,
      priority,
      targetType,
      targetPayload,
      publishNow: true,
      attachments,
    };
  };

  const handlePublish = () => {
    const payload = buildPayload();

    if (!payload) {
      return;
    }

    composer.mutate(payload);
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
            Create Memo
          </Heading>

          <Box className="h-10 w-10" />
        </HStack>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="mx-auto w-full max-w-3xl gap-5 px-4 py-5 pb-40 md:px-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-sm font-semibold">
                  Subject
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="h-12 rounded-xl border-border bg-card">
                <InputField
                  placeholder="Memo subject"
                  value={subject}
                  onChangeText={setSubject}
                  maxLength={255}
                  accessibilityLabel="Memo subject"
                  className="px-3 text-sm text-foreground"
                />
              </Input>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-sm font-semibold">
                  Message
                </FormControlLabelText>
              </FormControlLabel>
              <MemoRichTextEditor
                value={bodyHtml}
                onChange={setBodyHtml}
                placeholder="Write your memo..."
              />
            </FormControl>

            <MemoAttachmentPicker
              attachments={attachments}
              onChange={setAttachments}
            />

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-sm font-semibold">
                  Category
                </FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue={category}
                onValueChange={(value) => setCategory(value as MemoCategory)}
              >
                <SelectTrigger className="h-12 rounded-xl bg-card">
                  <SelectInput
                    value={getOptionLabel(CATEGORY_OPTIONS, category)}
                    editable={false}
                    className="flex-1"
                  />
                  <SelectIcon className="mr-3" as={ChevronDown} />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-sm font-semibold">
                  Priority
                </FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue={priority}
                onValueChange={(value) => setPriority(value as MemoPriority)}
              >
                <SelectTrigger className="h-12 rounded-xl bg-card">
                  <SelectInput
                    value={getOptionLabel(PRIORITY_OPTIONS, priority)}
                    editable={false}
                    className="flex-1"
                  />
                  <SelectIcon className="mr-3" as={ChevronDown} />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </FormControl>

            <MemoAudienceFields
              audience={audience}
              onChange={setAudience}
              userSearch={userSearch}
              onUserSearchChange={setUserSearch}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <Box
          className="absolute bottom-0 left-0 right-0 border-t border-border/20 bg-card shadow-sm"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <VStack className="mx-auto w-full max-w-3xl gap-3 px-4 pt-4">
            <Button
              size="lg"
              isDisabled={!isFormValid || composer.isPending}
              onPress={handlePublish}
              className="min-h-11 w-full rounded-xl bg-secondary shadow-md data-[active=true]:bg-secondary/90"
            >
              {composer.isPending ? (
                <ButtonSpinner className="text-secondary-foreground" />
              ) : null}
              <ButtonText className="font-semibold text-secondary-foreground">
                Publish Memo
              </ButtonText>
            </Button>
          </VStack>
        </Box>
      </Box>
    </SafeAreaView>
  );
}
