import {
  RichText,
  Toolbar,
  useEditorBridge,
  useEditorContent,
} from "@10play/tentap-editor";
import { useEffect, useRef, useState } from "react";
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
}: Readonly<MemoRichTextEditorProps>) {
  // Freeze initial HTML so bridge options stay stable across parent re-renders.
  const [initialContent] = useState(() => value || "");
  const lastEmittedHtml = useRef(value);
  const isApplyingExternalValue = useRef(false);
  const lastPlaceholderRef = useRef<string | null>(null);
  const onChangeRef = useRef(onChange);

  const editor = useEditorBridge({
    initialContent,
    avoidIosKeyboard: false,
    // dynamicHeight remounts/resizes the WebView on each content height change
    // and is a known source of scroll jumps / flicker in tentap.
    dynamicHeight: false,
    theme: memoEditorTheme,
  });

  // Bridge methods close over a stable webviewRef, so the first instance is enough.
  const editorRef = useRef(editor);

  const content = useEditorContent(editor, {
    type: "html",
    debounceInterval: 250,
  });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const applyEditorStyles = () => {
    editorRef.current.injectCSS(memoEditorContentCss, "memo-editor-content");
  };

  useEffect(() => {
    if (lastPlaceholderRef.current === placeholder) {
      return;
    }

    lastPlaceholderRef.current = placeholder;
    editorRef.current.setPlaceholder(placeholder);
  }, [placeholder]);

  useEffect(() => {
    if (content === undefined) {
      return;
    }

    // Ignore the echo from a programmatic setContent (external value sync).
    if (isApplyingExternalValue.current) {
      isApplyingExternalValue.current = false;
      lastEmittedHtml.current = content;
      return;
    }

    if (content === lastEmittedHtml.current) {
      return;
    }

    lastEmittedHtml.current = content;
    onChangeRef.current(content);
  }, [content]);

  useEffect(() => {
    // Only push into the WebView for true external updates (draft load, reset, etc.).
    // Do not depend on `editor` — its identity changes every render.
    if (value === lastEmittedHtml.current) {
      return;
    }

    isApplyingExternalValue.current = true;
    lastEmittedHtml.current = value;
    editorRef.current.setContent(value || "");
  }, [value]);

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

      <Box className="bg-card" style={styles.editorShell}>
        <RichText
          editor={editor}
          style={styles.editor}
          containerStyle={styles.editorContainer}
          scrollEnabled
          onLoad={applyEditorStyles}
        />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  editorShell: {
    height: MEMO_EDITOR_MIN_HEIGHT,
  },
  editor: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  editorContainer: {
    flex: 1,
    height: MEMO_EDITOR_MIN_HEIGHT,
  },
});
