import { Text } from "@/src/shared/components/ui/text";

type FormErrorMessageProps = {
  message?: string | null;
  className?: string;
};

export function FormErrorMessage({
  message,
  className,
}: FormErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <Text className={`text-sm text-destructive ${className ?? "px-1"}`}>
      {message}
    </Text>
  );
}
