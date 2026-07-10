import type { Institution } from "@/src/features/auth/api/authApi";
import type { User } from "@/src/shared/types";

export type DiscoveryMode = "email" | "shortcode";

export type AuthStatus = "idle" | "loading" | "succeeded" | "failed";

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isFirstSetup: boolean;
  otpSentAt: number | null;
  status: AuthStatus;
  error: string | null;
  institution: Institution | null;
  pendingPassword: string | null;
  pendingAdmissionNumber: string | null;
  pendingEmail: string | null;
  verifiedOtp: string | null;
}

export const OTP_RESEND_COOLDOWN_MS = 60_000;
