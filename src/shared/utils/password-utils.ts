export type PasswordRequirementKey =
  | "length"
  | "uppercase"
  | "number"
  | "special";

export type PasswordRequirement = {
  key: PasswordRequirementKey;
  label: string;
  test: (value: string) => boolean;
};

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (value) => /.{8,}/.test(value),
  },
  {
    key: "uppercase",
    label: "One uppercase letter",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    key: "number",
    label: "One number",
    test: (value) => /[0-9]/.test(value),
  },
  {
    key: "special",
    label: "One special character (!@#$%^&*)",
    test: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
  },
];

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export function getPasswordStrength(metCount: number): PasswordStrength {
  if (metCount <= 0) {
    return "weak";
  }

  if (metCount <= 2) {
    return "fair";
  }

  if (metCount === 3) {
    return "good";
  }

  return "strong";
}

export function getMetRequirementCount(value: string) {
  return PASSWORD_REQUIREMENTS.filter((requirement) =>
    requirement.test(value),
  ).length;
}

export function isPasswordValid(value: string) {
  return getMetRequirementCount(value) === PASSWORD_REQUIREMENTS.length;
}
