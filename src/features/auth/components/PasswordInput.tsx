import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";

import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/shared/components/ui/form-control";
import { HStack } from "@/src/shared/components/ui/hstack";
import { Box } from "@/src/shared/components/ui/box";
import { Input, InputField, InputSlot } from "@/src/shared/components/ui/input";
import { Pressable } from "@/src/shared/components/ui/pressable";
import {
  usePasswordStrength,
  type PasswordStrengthLevel,
} from "@/src/features/auth/hooks/usePasswordStrength";

type PasswordInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  label: string;
  accessibilityLabel: string;
  showStrengthBar?: boolean;
  error?: string | null;
};

const STRENGTH_SEGMENT_COLORS: Record<
  PasswordStrengthLevel,
  [string, string, string]
> = {
  weak: ["bg-destructive", "bg-muted", "bg-muted"],
  fair: ["bg-secondary", "bg-secondary", "bg-muted"],
  strong: ["bg-success", "bg-success", "bg-success"],
};

function StrengthBar({ password }: { password: string }) {
  const { strength, score } = usePasswordStrength(password);

  if (!password) {
    return null;
  }

  const colors =
    score === 0
      ? ["bg-muted", "bg-muted", "bg-muted"]
      : STRENGTH_SEGMENT_COLORS[strength];

  return (
    <HStack className="mt-2 h-1.5 gap-1">
      {colors.map((color, index) => (
        <Box key={index} className={`h-full flex-1 rounded-full ${color}`} />
      ))}
    </HStack>
  );
}

export function PasswordInput({
  value,
  onChangeText,
  placeholder,
  label,
  accessibilityLabel,
  showStrengthBar = false,
  error,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormControl isInvalid={Boolean(error)}>
      <FormControlLabel>
        <FormControlLabelText className="text-sm font-semibold text-foreground">
          {label}
        </FormControlLabelText>
      </FormControlLabel>

      <Input className="h-12 rounded-xl border-border bg-card data-[focus=true]:border-primary">
        <InputField
          secureTextEntry={!isVisible}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          accessibilityLabel={accessibilityLabel}
          autoCapitalize="none"
          autoCorrect={false}
          className="px-3 text-base text-foreground"
        />
        <InputSlot className="pr-3">
          <Pressable
            onPress={() => setIsVisible((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={isVisible ? "Hide password" : "Show password"}
            className="h-8 w-8 items-center justify-center rounded-md data-[active=true]:bg-muted"
          >
            {isVisible ? (
              <EyeOff className="h-5 w-5 text-primary" />
            ) : (
              <Eye className="h-5 w-5 text-primary" />
            )}
          </Pressable>
        </InputSlot>
      </Input>

      {showStrengthBar ? <StrengthBar password={value} /> : null}

      {error ? (
        <FormControlError>
          <FormControlErrorText className="text-sm">{error}</FormControlErrorText>
        </FormControlError>
      ) : null}
    </FormControl>
  );
}