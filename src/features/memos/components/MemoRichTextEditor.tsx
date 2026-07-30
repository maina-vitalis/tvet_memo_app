import {
  RichText,
  Toolbar,
  useEditorBridge,
  useEditorContent,
} from "@10play/tentap-editor";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";

import {
  memoEditorContentCss,
  memoEditorTheme,
  MEMO_EDITOR_MIN_HEIGHT,
  memoToolbarItems,
} from "@/src/features/memos/components/memoRichTextEditorTheme";
import type { MemoRichTextEditorProps } from "@/src/features/memos/components/memoRichTextEditor.types";
import { Box } from "@/src/shared/components/ui/box";

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
    dynamicHeight: true,
    theme: memoEditorTheme,
  });

  const content = useEditorContent(editor, {
    type: "html",
    debounceInterval: 200,
  });

  const applyEditorStyles = useCallback(() => {
    editor.injectCSS(memoEditorContentCss, "memo-editor-content");
  }, [editor]);

  useEffect(() => {
    editor.setPlaceholder(placeholder);
  }, [editor, placeholder]);

  useEffect(() => {
    applyEditorStyles();
  }, [applyEditorStyles]);

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
    <Box className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <Box className="border-b border-border bg-muted/50 px-2 py-1.5">
        <Toolbar
          editor={editor}
          hidden={false}
          items={memoToolbarItems}
          shouldHideDisabledToolbarItems
        />
      </Box>

      <Box className="bg-card">
        <RichText
          editor={editor}
          style={styles.editor}
          containerStyle={styles.editorContainer}
          onLoad={applyEditorStyles}
        />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  editor: {
    minHeight: MEMO_EDITOR_MIN_HEIGHT,
    backgroundColor: "#ffffff",
  },
  editorContainer: {
    minHeight: MEMO_EDITOR_MIN_HEIGHT,
  },
});
