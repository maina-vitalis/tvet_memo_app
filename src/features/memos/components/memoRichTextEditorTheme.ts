import {
  DEFAULT_TOOLBAR_ITEMS,
  type EditorTheme,
  type ToolbarItem,
} from "@10play/tentap-editor";

/** Matches design tokens from global.css */
const colors = {
  card: "#ffffff",
  border: "#e2e8f0",
  muted: "#f8fafc",
  mutedForeground: "#64748b",
  foreground: "#0f172a",
  primary: "#234698",
  icon: "#475569",
  iconActiveBg: "#e2e8f0",
  placeholder: "#94a3b8",
} as const;

export const MEMO_EDITOR_MIN_HEIGHT = 200;

export const memoEditorTheme: Partial<EditorTheme> = {
  toolbar: {
    toolbarBody: {
      borderTopWidth: 0,
      borderBottomWidth: 0,
      backgroundColor: "transparent",
      minWidth: "100%",
      height: 40,
    },
    toolbarButton: {
      paddingHorizontal: 4,
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrapper: {
      borderRadius: 8,
      backgroundColor: "transparent",
      height: 34,
      width: 34,
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrapperActive: {
      backgroundColor: colors.iconActiveBg,
    },
    iconWrapperDisabled: {
      opacity: 0.35,
    },
    icon: {
      height: 20,
      width: 20,
      tintColor: colors.icon,
    },
    iconActive: {
      tintColor: colors.primary,
    },
    iconDisabled: {
      tintColor: colors.mutedForeground,
    },
    hidden: {
      display: "none",
    },
    keyboardAvoidingView: {
      position: "absolute",
      width: "100%",
      bottom: 0,
    },
    linkBarTheme: {
      addLinkContainer: {
        flex: 1,
        flexDirection: "row",
        height: 44,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: colors.border,
        borderBottomColor: colors.border,
        backgroundColor: colors.muted,
        paddingHorizontal: 8,
        alignItems: "center",
      },
      linkInput: {
        paddingHorizontal: 12,
        flex: 1,
        color: colors.foreground,
        fontSize: 14,
      },
      placeholderTextColor: colors.placeholder,
      doneButton: {
        backgroundColor: colors.iconActiveBg,
        justifyContent: "center",
        height: 32,
        paddingHorizontal: 12,
        borderRadius: 8,
      },
      doneButtonText: {
        color: colors.primary,
        fontWeight: "600",
        fontSize: 14,
      },
      linkToolbarButton: {
        paddingHorizontal: 0,
      },
    },
  },
  webview: {
    backgroundColor: colors.card,
  },
  webviewContainer: {
    minHeight: MEMO_EDITOR_MIN_HEIGHT,
  },
};

export const memoEditorContentCss = `
  html, body {
    margin: 0;
    background-color: ${colors.card};
  }

  .ProseMirror {
    min-height: ${MEMO_EDITOR_MIN_HEIGHT}px;
    padding: 12px 16px;
    font-size: 16px;
    line-height: 24px;
    color: ${colors.foreground};
    outline: none;
    caret-color: ${colors.primary};
  }

  .ProseMirror p {
    margin: 0 0 12px;
  }

  .ProseMirror p:last-child {
    margin-bottom: 0;
  }

  .ProseMirror h1 {
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
    margin: 0 0 12px;
  }

  .ProseMirror h2 {
    font-size: 20px;
    font-weight: 700;
    line-height: 28px;
    margin: 0 0 10px;
  }

  .ProseMirror ul,
  .ProseMirror ol {
    margin: 0 0 12px;
    padding-left: 24px;
  }

  .ProseMirror li {
    margin-bottom: 4px;
  }

  .ProseMirror blockquote {
    margin: 0 0 12px;
    padding-left: 12px;
    border-left: 3px solid ${colors.border};
    color: ${colors.mutedForeground};
  }

  .is-editor-empty:first-child::before {
    color: ${colors.placeholder} !important;
  }
`;

/** Focused toolbar: formatting essentials for memo composition */
export const memoToolbarItems: ToolbarItem[] = [
  DEFAULT_TOOLBAR_ITEMS[0], // bold
  DEFAULT_TOOLBAR_ITEMS[1], // italic
  DEFAULT_TOOLBAR_ITEMS[6], // underline
  DEFAULT_TOOLBAR_ITEMS[7], // strikethrough
  DEFAULT_TOOLBAR_ITEMS[10], // bullet list
  DEFAULT_TOOLBAR_ITEMS[9], // ordered list
  DEFAULT_TOOLBAR_ITEMS[4], // headings
  DEFAULT_TOOLBAR_ITEMS[13], // undo
  DEFAULT_TOOLBAR_ITEMS[14], // redo
];
