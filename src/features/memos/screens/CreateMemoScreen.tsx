import { router } from "expo-router";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useCreateMemo } from "@/src/features/memos/hooks/useCreateMemo";
import { useCanCreateMemo } from "@/src/features/memos/hooks/useMemoPermissions";
import type {
  MemoCategory,
  MemoPriority,
  MemoTargetType,
} from "@/src/features/memos/types/CreateMemoTypes";
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

const TARGET_OPTIONS: { label: string; value: MemoTargetType }[] = [
  { label: "Everyone", value: "broadcast" },
  { label: "Department", value: "department" },
  { label: "Role", value: "role" },
  { label: "Individual", value: "individual" },
];

function getOptionLabel<T extends string>(
  options: { label: string; value: T }[],
  value: T,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export default function CreateMemoScreen() {
  const insets = useSafeAreaInsets();
  const canCreateMemo = useCanCreateMemo();
  const createMemo = useCreateMemo();

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<MemoCategory>("general");
  const [priority, setPriority] = useState<MemoPriority>("normal");
  const [targetType, setTargetType] = useState<MemoTargetType>("broadcast");
  const [requiresAck, setRequiresAck] = useState(false);

  const trimmedSubject = subject.trim();
  const trimmedBody = body.trim();
  const canSubmit =
    trimmedSubject.length > 0 &&
    trimmedBody.length > 0 &&
    !createMemo.isPending;

  if (!canCreateMemo) {
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

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    createMemo.mutate({
      subject: trimmedSubject,
      body: trimmedBody,
      category,
      priority,
      targetType,
      requiresAck,
    });
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
            contentContainerClassName="mx-auto w-full max-w-3xl gap-5 px-4 py-5 md:px-6"
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

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-sm font-semibold">
                  Audience
                </FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue={targetType}
                onValueChange={(value) =>
                  setTargetType(value as MemoTargetType)
                }
              >
                <SelectTrigger className="h-12 rounded-lg bg-card">
                  <SelectInput
                    value={getOptionLabel(TARGET_OPTIONS, targetType)}
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
                    {TARGET_OPTIONS.map((option) => (
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
          className="border-t border-border/20 bg-card shadow-sm"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <VStack className="mx-auto w-full max-w-3xl px-4 pt-4">
            <Button
              size="lg"
              isDisabled={!canSubmit}
              onPress={handleSubmit}
              className="min-h-11 w-full rounded-lg bg-secondary shadow-md data-[active=true]:bg-secondary/90"
            >
              {createMemo.isPending ? (
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
