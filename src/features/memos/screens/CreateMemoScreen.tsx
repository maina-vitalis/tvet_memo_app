import { router } from "expo-router";
import { ArrowLeft, Calendar, ChevronDown } from "lucide-react-native";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { MemoAudienceFields } from "@/src/features/memos/components/MemoAudienceFields";
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
  DateTimePicker,
  DateTimePickerIcon,
  DateTimePickerInput,
  DateTimePickerTrigger,
} from "@/src/shared/components/ui/date-time-picker";
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
import { Switch } from "@/src/shared/components/ui/switch";
import { Text } from "@/src/shared/components/ui/text";
import { Textarea, TextareaInput } from "@/src/shared/components/ui/textarea";
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
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<MemoCategory>("general");
  const [priority, setPriority] = useState<MemoPriority>("normal");
  const [audience, setAudience] =
    useState<MemoAudienceSelection>(DEFAULT_AUDIENCE);
  const [requiresAck, setRequiresAck] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>();
  const [userSearch, setUserSearch] = useState("");

  const trimmedSubject = subject.trim();
  const trimmedBody = body.trim();

  const isFormValid = useMemo(() => {
    if (!actorRole || trimmedSubject.length === 0 || trimmedBody.length === 0) {
      return false;
    }

    if (!isAudienceSelectionValid(actorRole, audience)) {
      return false;
    }

    if (scheduleEnabled && !scheduledAt) {
      return false;
    }

    return true;
  }, [
    actorRole,
    audience,
    scheduleEnabled,
    scheduledAt,
    trimmedBody.length,
    trimmedSubject.length,
  ]);

  const isScheduledForFuture = scheduleEnabled && scheduledAt !== undefined;

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

  const buildPayload = (publishNow: boolean) => {
    if (!actorRole) {
      return null;
    }

    const { targetType, targetPayload } = buildMemoTargetPayload(
      actorRole,
      audience,
    );

    return {
      subject: trimmedSubject,
      body: trimmedBody,
      category,
      priority,
      targetType,
      targetPayload,
      requiresAck,
      scheduledAt:
        scheduleEnabled && scheduledAt ? scheduledAt.toISOString() : undefined,
      publishNow,
    };
  };

  const handleSaveDraft = () => {
    const payload = buildPayload(false);

    if (!payload) {
      return;
    }

    composer.mutate(payload);
  };

  const handlePublish = () => {
    const payload = buildPayload(!isScheduledForFuture);

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
              <Input className="h-12 rounded-lg border-border bg-card">
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
              <Textarea className="min-h-40 rounded-lg border-border bg-card">
                <TextareaInput
                  placeholder="Write your memo..."
                  value={body}
                  onChangeText={setBody}
                  multiline
                  textAlignVertical="top"
                  accessibilityLabel="Memo body"
                  className="px-3 py-3 text-sm text-foreground"
                />
              </Textarea>
            </FormControl>

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
                <SelectTrigger className="h-12 rounded-lg bg-card">
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
                <SelectTrigger className="h-12 rounded-lg bg-card">
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

            <HStack className="items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <VStack className="flex-1 pr-4">
                <Text className="text-sm font-semibold text-foreground">
                  Schedule for later
                </Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  Save as scheduled and publish automatically at the chosen
                  time.
                </Text>
              </VStack>
              <Switch
                value={scheduleEnabled}
                onValueChange={(enabled) => {
                  setScheduleEnabled(enabled);
                  if (!enabled) {
                    setScheduledAt(undefined);
                  }
                }}
                accessibilityLabel="Schedule for later"
              />
            </HStack>

            {scheduleEnabled ? (
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-sm font-semibold">
                    Send at
                  </FormControlLabelText>
                </FormControlLabel>
                <DateTimePicker
                  mode="datetime"
                  value={scheduledAt}
                  minimumDate={new Date()}
                  onChange={(date) => setScheduledAt(date)}
                  placeholder="Pick date and time"
                  format="YYYY-MM-DD HH:mm"
                >
                  <DateTimePickerTrigger className="h-12 rounded-lg border border-border bg-card px-3">
                    <DateTimePickerInput className="flex-1 text-sm" />
                    <DateTimePickerIcon as={Calendar} className="mr-1" />
                  </DateTimePickerTrigger>
                </DateTimePicker>
              </FormControl>
            ) : null}

            <HStack className="items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <VStack className="flex-1 pr-4">
                <Text className="text-sm font-semibold text-foreground">
                  Require acknowledgement
                </Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">
                  Recipients must confirm they have read this memo.
                </Text>
              </VStack>
              <Switch
                value={requiresAck}
                onValueChange={setRequiresAck}
                accessibilityLabel="Require acknowledgement"
              />
            </HStack>
          </ScrollView>
        </KeyboardAvoidingView>

        <Box
          className="absolute bottom-0 left-0 right-0 border-t border-border/20 bg-card shadow-sm"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <VStack className="mx-auto w-full max-w-3xl gap-3 px-4 pt-4">
            <Button
              variant="outline"
              size="lg"
              isDisabled={!isFormValid || composer.isPending}
              onPress={handleSaveDraft}
              className="min-h-11 w-full rounded-lg"
            >
              {composer.isPending ? <ButtonSpinner /> : null}
              <ButtonText className="font-semibold">Save Draft</ButtonText>
            </Button>
            <Button
              size="lg"
              isDisabled={!isFormValid || composer.isPending}
              onPress={handlePublish}
              className="min-h-11 w-full rounded-lg bg-secondary shadow-md data-[active=true]:bg-secondary/90"
            >
              {composer.isPending ? (
                <ButtonSpinner className="text-secondary-foreground" />
              ) : null}
              <ButtonText className="font-semibold text-secondary-foreground">
                {isScheduledForFuture ? "Schedule Memo" : "Publish Memo"}
              </ButtonText>
            </Button>
          </VStack>
        </Box>
      </Box>
    </SafeAreaView>
  );
}
