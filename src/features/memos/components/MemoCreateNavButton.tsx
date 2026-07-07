import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import type { ComponentProps } from "react";

import { MEMO_ROUTES } from "@/src/features/memos/navigation";
import { Box } from "@/src/shared/components/ui/box";
import { Pressable } from "@/src/shared/components/ui/pressable";
import { Text } from "@/src/shared/components/ui/text";
import { cn } from "@/src/shared/utils/cn";

type MemoCreateNavButtonProps = {
  variant?: "fab" | "rail";
  className?: string;
  onPress?: () => void;
} & Pick<ComponentProps<typeof Pressable>, "accessibilityLabel">;

export function MemoCreateNavButton({
  variant = "fab",
  className,
  onPress,
  accessibilityLabel = "Create memo",
}: MemoCreateNavButtonProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    router.push(MEMO_ROUTES.create);
  };

  if (variant === "rail") {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={handlePress}
        className={cn(
          "items-center justify-center rounded-2xl bg-primary px-3 py-3 shadow-md active:scale-95 data-[active=true]:bg-primary/90",
          className,
        )}
      >
        <Plus className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
        <Text className="mt-1 text-[10px] font-bold text-primary-foreground">
          Create
        </Text>
      </Pressable>
    );
  }

  return (
    <Box className={cn("min-w-[72px] flex-1 items-center justify-end pb-1", className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={handlePress}
        className="-mt-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:scale-95 data-[active=true]:bg-primary/90"
      >
        <Plus className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
      </Pressable>
      <Text className="mt-1 text-xs font-bold text-primary">Create</Text>
    </Box>
  );
}
