import { actions, RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { useRef } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";

import { Box } from "@/src/shared/components/ui/box";
import { Text } from "@/src/shared/components/ui/text";

type MemoRichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function MemoRichTextEditor({
  value,
  onChange,
  placeholder = "Write your memo...",
}: MemoRichTextEditorProps) {
  const editorRef = useRef<RichEditor>(null);

  return (
    <Box className="overflow-hidden rounded-lg border border-border bg-card">
      <RichToolbar
        editor={editorRef}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.heading1,
          actions.heading2,
          actions.setStrikethrough,
          actions.removeFormat,
        ]}
        style={{
          backgroundColor: "#f8fafc",
          borderBottomWidth: 1,
          borderBottomColor: "#e2e8f0",
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <RichEditor
          ref={editorRef}
          initialContentHTML={value}
          placeholder={placeholder}
          onChange={onChange}
          editorStyle={{
            backgroundColor: "#ffffff",
            color: "#0f172a",
            placeholderColor: "#94a3b8",
            contentCSSText: "font-size: 16px; line-height: 24px; padding: 12px;",
          }}
          style={{ minHeight: 180 }}
        />
      </KeyboardAvoidingView>

      <Text className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
        Use the toolbar for bold, lists, and headings.
      </Text>
    </Box>
  );
}
