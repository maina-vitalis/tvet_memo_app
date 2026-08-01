import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useState } from "react";

import {
  checkEmail,
  completeAccountSetup,
  login,
  logout,
  sendOtp,
  signupRegister,
  verifyOtp,
} from "@/src/features/auth/api/authApi";
import { clearAuthSession } from "@/src/features/auth/api/sessionCleanup";
import {
  AUTH_ROUTE_PATHS,
  AUTH_ROUTES,
  resolvePostAuthRoute,
} from "@/src/features/auth/navigation";
import {
  setCredentials,
  setOtpSentAt,
  setPendingEmail,
} from "@/src/features/auth/store/authSlice";
import { useMutationToast } from "@/src/shared/hooks/useMutationToast";
import { getFormErrorMessage } from "@/src/shared/utils/formErrors";
import { useAppDispatch } from "@/src/shared/store/hooks";

function useFormMutationError(fallback: string) {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback(
    (mutationError: unknown) => {
      setError(getFormErrorMessage(mutationError, fallback));
    },
    [fallback],
  );

  const resetError = useCallback(() => setError(null), []);

  return { error, handleError, resetError };
}

export function useCheckEmail() {
  const dispatch = useAppDispatch();
  const { error, handleError, resetError } = useFormMutationError(
    "Could not verify this email. Please try again.",
  );

  const mutation = useMutation({
    mutationFn: checkEmail,
    onMutate: resetError,
    onSuccess: (result, email) => {
      const normalizedEmail = email.trim().toLowerCase();
      dispatch(setPendingEmail(normalizedEmail));

      if (!result.exists) {
        router.push({
          pathname: AUTH_ROUTE_PATHS.password,
          params: { mode: "setup" },
        });
        return;
      }

      if (result.pendingVerification) {
        router.push({
          pathname: AUTH_ROUTE_PATHS.verifyEmail,
          params: { email: normalizedEmail },
        });
        return;
      }

      router.push({
        pathname: AUTH_ROUTE_PATHS.password,
        params: { mode: "login" },
      });
    },
    onError: handleError,
  });

  return {
    checkEmail: mutation.mutate,
    checkEmailAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error,
    resetError,
  };
}

export function useSignupRegister() {
  const dispatch = useAppDispatch();
  const { error, handleError, resetError } = useFormMutationError(
    "Could not create your account. Please try again.",
  );

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signupRegister(email, password),
    onMutate: resetError,
    onSuccess: (result, variables) => {
      const normalizedEmail = variables.email.trim().toLowerCase();
      dispatch(setPendingEmail(normalizedEmail));
      // Registration already sent the code. Record it so the OTP screen does
      // not fire a resend on mount — that resend would replace the code the
      // user is about to read out of their inbox.
      dispatch(setOtpSentAt(result.sentAt));
      router.push({
        pathname: AUTH_ROUTE_PATHS.verifyEmail,
        params: { email: normalizedEmail },
      });
    },
    onError: handleError,
  });

  return {
    signupRegister: mutation.mutate,
    signupRegisterAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error,
    resetError,
  };
}

export function useSendOtp() {
  const dispatch = useAppDispatch();
  const { error, handleError, resetError } = useFormMutationError(
    "Could not send verification code. Please try again.",
  );

  const mutation = useMutation({
    mutationFn: sendOtp,
    onMutate: resetError,
    onSuccess: (result) => {
      dispatch(setOtpSentAt(result.sentAt));
    },
    onError: handleError,
  });

  return {
    sendOtp: mutation.mutate,
    sendOtpAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error,
    resetError,
  };
}

export function useVerifyOtp() {
  const dispatch = useAppDispatch();
  const { error, handleError, resetError } = useFormMutationError(
    "Invalid verification code. Please try again.",
  );

  const mutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      verifyOtp(email, otp),
    onMutate: resetError,
    onSuccess: (session) => {
      dispatch(
        setCredentials({
          user: session.user,
          token: session.token,
          refreshToken: session.refreshToken,
        }),
      );
      router.replace(resolvePostAuthRoute(session.user.mustChangePassword));
    },
    onError: handleError,
  });

  return {
    verifyOtp: mutation.mutate,
    verifyOtpAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error,
    resetError,
  };
}

export function useLogin() {
  const dispatch = useAppDispatch();
  const { error, handleError, resetError } = useFormMutationError(
    "Invalid email or password.",
  );

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onMutate: resetError,
    onSuccess: (session) => {
      dispatch(
        setCredentials({
          user: session.user,
          token: session.token,
          refreshToken: session.refreshToken,
        }),
      );
      router.replace(resolvePostAuthRoute(session.user.mustChangePassword));
    },
    onError: handleError,
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error,
    resetError,
  };
}

export function useAccountSetup() {
  const dispatch = useAppDispatch();
  const { error, handleError, resetError } = useFormMutationError(
    "Invalid or expired setup link. Please contact your administrator.",
  );

  const mutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      completeAccountSetup(token, password),
    onMutate: resetError,
    onSuccess: (session) => {
      dispatch(
        setCredentials({
          user: session.user,
          token: session.token,
          refreshToken: session.refreshToken,
        }),
      );
      router.replace(resolvePostAuthRoute(session.user.mustChangePassword));
    },
    onError: handleError,
  });

  return {
    completeAccountSetup: mutation.mutate,
    isPending: mutation.isPending,
    error,
    resetError,
  };
}

export function useLogout() {
  const { showError } = useMutationToast();

  return useMutation({
    mutationFn: async () => {
      try {
        await logout();
      } finally {
        await clearAuthSession();
      }
    },
    onSuccess: () => {
      router.replace(AUTH_ROUTES.login);
    },
    onError: (mutationError) => {
      router.replace(AUTH_ROUTES.login);
      showError(mutationError, "Could not sign out cleanly.");
    },
  });
}
