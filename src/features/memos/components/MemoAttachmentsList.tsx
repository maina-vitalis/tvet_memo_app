import * as Linking from "expo-linking";
import { FileText, Image as ImageIcon, Paperclip } from "lucide-react-native";

import type { MemoAttachmentItem } from "@/src/features/memos/types/MemoTypes";
import { formatFileSize } from "@/src/features/memos/utils/memoContent";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";

type MemoAttachmentsListProps = {
  attachments: MemoAttachmentItem[];
};

function AttachmentIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-4 w-4 text-primary" />;
  }

  if (mimeType === "application/pdf") {
    return <FileText className="h-4 w-4 text-primary" />;
  }

  return <Paperclip className="h-4 w-4 text-primary" />;
}

export function MemoAttachmentsList({ attachments }: MemoAttachmentsListProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <VStack className="gap-2 border-t border-border pt-4">
      <Text className="text-sm font-semibold text-foreground">Attachments</Text>

      {attachments.map((attachment) => (
        <Pressable
          key={attachment.id}
          onPress={() => {
            void Linking.openURL(attachment.url);
          }}
          className="rounded-lg border border-border bg-muted/30 px-3 py-3 data-[active=true]:bg-muted/60"
        >
          <HStack className="items-center gap-3">
            <AttachmentIcon mimeType={attachment.mimeType} />
            <VStack className="flex-1">
              <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                {attachment.fileName}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {formatFileSize(attachment.sizeBytes)}
              </Text>
            </VStack>
          </HStack>
        </Pressable>
      ))}
    </VStack>
  );
}
