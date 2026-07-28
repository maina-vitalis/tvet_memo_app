import { useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";

import { MemoDetail } from "@/src/features/memos/components/MemoDetail";
import { Box } from "@/src/shared/components/ui/box";

type MemoBodyContentProps = {
  body: string;
  bodyFormat?: "plain" | "html";
};

export function MemoBodyContent({
  body,
  bodyFormat = "plain",
}: MemoBodyContentProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 48, 720);

  if (bodyFormat === "html") {
    return (
      <Box className="py-1">
        <RenderHTML
          contentWidth={contentWidth}
          source={{ html: body }}
          baseStyle={{
            color: "#0f172a",
            fontSize: 16,
            lineHeight: 24,
          }}
          tagsStyles={{
            p: { marginBottom: 12 },
            ul: { marginBottom: 12, paddingLeft: 18 },
            ol: { marginBottom: 12, paddingLeft: 18 },
            li: { marginBottom: 4 },
            h1: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
            h2: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
            h3: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
            strong: { fontWeight: "700" },
            em: { fontStyle: "italic" },
            a: { color: "#1d4ed8", textDecorationLine: "underline" },
          }}
        />
      </Box>
    );
  }

  return <MemoDetail blocks={[{ type: "paragraph", text: body }]} />;
}

/** Returns true when HTML content is effectively empty. */
export function isRichTextEmpty(html: string): boolean {
  const stripped = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();

  return stripped.length === 0;
}

export function plainTextFromHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}
