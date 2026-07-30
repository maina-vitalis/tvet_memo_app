import {
  RichText,
  Toolbar,
  useEditorBridge,
  useEditorContent,
} from "@10play/tentap-editor";
import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";

import type { MemoRichTextEditorProps } from "@/src/features/memos/components/memoRichTextEditor.types";
import { Box } from "@/src/shared/components/ui/box";
import { Text } from "@/src/shared/components/ui/text";

export function MemoRichTextEditor({
  value,
  onChange,
  placeholder = "Write your memo...",
}: MemoRichTextEditorProps) {
  const lastEmittedHtml = useRef(value);
  const skipNextContentSync = useRef(false);

  const editor = useEditorBridge({
    initialContent: value || "",
    avoidIosKeyboard: false,
  });

  const content = useEditorContent(editor, {
    type: "html",
    debounceInterval: 200,
  });

  useEffect(() => {
    editor.setPlaceholder(placeholder);
  }, [editor, placeholder]);

  useEffect(() => {
    if (content === undefined) {
      return;
    }

    if (skipNextContentSync.current) {
      skipNextContentSync.current = false;
      return;
    }

    if (content === lastEmittedHtml.current) {
      return;
    }

    lastEmittedHtml.current = content;
    onChange(content);
  }, [content, onChange]);

  useEffect(() => {
    if (value === lastEmittedHtml.current) {
      return;
    }

    skipNextContentSync.current = true;
    editor.setContent(value || "");
    lastEmittedHtml.current = value;
  }, [value, editor]);

  return (
    <Box className="overflow-hidden rounded-xl border border-border bg-card">
      <Toolbar editor={editor} hidden={false} />

      <RichText
        editor={editor}
        style={styles.editor}
        containerStyle={styles.editorContainer}
      />

      <Text className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
        Use the toolbar for bold, lists, and headings.
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  editor: {
    minHeight: 180,
    height: 180,
    backgroundColor: "#ffffff",
  },
  editorContainer: {
    minHeight: 180,
    height: 180,
  },
});
