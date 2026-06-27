import { HStack } from "@/src/shared/components/ui/hstack";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import type { MemoBodyBlock } from "@/src/features/memos/types/MemoTypes";

export function MemoDetail({ blocks }: { blocks: MemoBodyBlock[] }) {
  return (
    <VStack className="gap-4">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <Text key={index} className="text-base leading-6 text-foreground">
              {block.text}
            </Text>
          );
        }

        if (block.type === "list") {
          return (
            <VStack key={index} className="gap-2 pl-4">
              {block.items.map((item, itemIndex) => (
                <HStack key={itemIndex} className="items-start gap-2">
                  <Text className="text-base text-muted-foreground">•</Text>
                  <Text className="flex-1 text-base leading-6 text-muted-foreground">
                    {item}
                  </Text>
                </HStack>
              ))}
            </VStack>
          );
        }

        return (
          <VStack key={index} className="gap-1">
            {block.lines.map((line, lineIndex) => (
              <Text
                key={lineIndex}
                className={`text-base leading-6 text-foreground ${
                  lineIndex === block.lines.length - 1 ? "font-semibold" : ""
                }`}
              >
                {line}
              </Text>
            ))}
          </VStack>
        );
      })}
    </VStack>
  );
}
