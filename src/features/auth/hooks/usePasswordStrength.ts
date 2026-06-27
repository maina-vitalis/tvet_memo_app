import { useMemo } from "react";

export type PasswordStrengthLevel = "weak" | "fair" | "strong";

export type PasswordStrengthResult = {
  strength: PasswordStrengthLevel;
  score: 0 | 1 | 2 | 3;
};

function countCriteria(password: string) {
  let count = 0;

  if (password.length >= 8) {
    count += 1;
  }

  if (/[A-Z]/.test(password)) {
    count += 1;
  }

  if (/[0-9]/.test(password)) {
    count += 1;
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    count += 1;
  }

  return count;
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { strength: "weak", score: 0 };
  }

  const met = countCriteria(password);

  if (met <= 1) {
    return { strength: "weak", score: 1 };
  }

  if (met <= 3) {
    return { strength: "fair", score: 2 };
  }

  return { strength: "strong", score: 3 };
}

export function usePasswordStrength(password: string): PasswordStrengthResult {
  return useMemo(() => getPasswordStrength(password), [password]);
}

export function isPasswordValid(password: string) {
  return countCriteria(password) === 4;
}