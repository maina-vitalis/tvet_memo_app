import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { FileText, Image as ImageIcon, Paperclip, X } from "lucide-react-native";
import { Alert } from "react-native";

import { formatFileSize } from "@/src/features/memos/utils/memoContent";
import { Box } from "@/src/shared/components/ui/box";
import { Button, ButtonText } from "@/src/shared/components/ui/button";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import { normalizeMimeType } from "@/src/shared/utils/multipartUpload";

export type LocalMemoAttachment = {
  uri: string;
  name: string;
  mimeType: string;
};

type MemoAttachmentPickerProps = {
  attachments: LocalMemoAttachment[];
  onChange: (attachments: LocalMemoAttachment[]) => void;
  maxFiles?: number;
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function guessSizeLabel(_attachment: LocalMemoAttachment): string {
  return "Pending upload";
}

function buildAttachment(
  uri: string,
  name: string,
  mimeType: string | null | undefined,
): LocalMemoAttachment | null {
  const normalizedMimeType = normalizeMimeType(mimeType, name);

  if (!ALLOWED_ATTACHMENT_MIMES.has(normalizedMimeType)) {
    Alert.alert(
      "Unsupported file",
      "Only JPEG, PNG, WEBP images and PDF documents can be attached.",
    );
    return null;
  }

  return {
    uri,
    name,
    mimeType: normalizedMimeType,
  };
}

export function MemoAttachmentPicker({
  attachments,
  onChange,
  maxFiles = 5,
}: MemoAttachmentPickerProps) {
  const canAddMore = attachments.length < maxFiles;

  const appendAttachment = (file: LocalMemoAttachment) => {
    if (attachments.length >= maxFiles) {
      Alert.alert("Attachment limit reached", `You can attach up to ${maxFiles} files.`);
      return;
    }

    onChange([...attachments, file]);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photos permission required",
        "Allow photo library access to attach images to your memo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_FILE_BYTES) {
      Alert.alert("File too large", "Each attachment must be 10 MB or smaller.");
      return;
    }

    const fileName = asset.fileName ?? `image-${Date.now()}.jpg`;
    const attachment = buildAttachment(asset.uri, fileName, asset.mimeType);
    if (attachment) {
      appendAttachment(attachment);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ["application/pdf", "image/*"],
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    if (asset.size && asset.size > MAX_FILE_BYTES) {
      Alert.alert("File too large", "Each attachment must be 10 MB or smaller.");
      return;
    }

    const attachment = buildAttachment(asset.uri, asset.name, asset.mimeType);
    if (attachment) {
      appendAttachment(attachment);
    }
  };

  const removeAttachment = (index: number) => {
    onChange(attachments.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <VStack className="gap-3">
      <HStack className="items-center justify-between">
        <Text className="text-sm font-semibold text-foreground">Attachments</Text>
        <Text className="text-xs text-muted-foreground">
          {attachments.length}/{maxFiles}
        </Text>
      </HStack>

      <HStack className="gap-2">
        <Button
          variant="outline"
          size="sm"
          isDisabled={!canAddMore}
          onPress={pickImage}
          className="flex-1"
        >
          <ImageIcon className="mr-1 h-4 w-4 text-primary" />
          <ButtonText>Image</ButtonText>
        </Button>
        <Button
          variant="outline"
          size="sm"
          isDisabled={!canAddMore}
          onPress={pickDocument}
          className="flex-1"
        >
          <FileText className="mr-1 h-4 w-4 text-primary" />
          <ButtonText>PDF / File</ButtonText>
        </Button>
      </HStack>

      <Text className="text-xs text-muted-foreground">
        Images and PDFs up to 10 MB each.
      </Text>

      {attachments.map((attachment, index) => (
        <HStack
          key={`${attachment.uri}-${index}`}
          className="items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2"
        >
          <HStack className="flex-1 items-center gap-2">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <VStack className="flex-1">
              <Text className="text-sm text-foreground" numberOfLines={1}>
                {attachment.name}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {guessSizeLabel(attachment)}
              </Text>
            </VStack>
          </HStack>
          <Pressable
            accessibilityLabel={`Remove ${attachment.name}`}
            onPress={() => removeAttachment(index)}
            className="h-8 w-8 items-center justify-center rounded-full data-[active=true]:bg-muted"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Pressable>
        </HStack>
      ))}

      {attachments.length === 0 ? (
        <Box className="rounded-lg border border-dashed border-border px-3 py-4">
          <Text className="text-center text-xs text-muted-foreground">
            No attachments yet.
          </Text>
        </Box>
      ) : null}
    </VStack>
  );
}
