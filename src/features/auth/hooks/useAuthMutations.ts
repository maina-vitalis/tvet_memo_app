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
import { AUTH_ROUTE_PATHS, AUTH_ROUTES } from "@/src/features/auth/navigation";
import {
  logout as logoutAction,
  setCredentials,
  setOtpSentAt,
  setPendingEmail,
} from "@/src/features/auth/store/authSlice";
import { useMutationToast } from "@/src/shared/hooks/useMutationToast";
import { useAppDispatch } from "@/src/shared/store/hooks";

export function useCheckEmail() {
  const dispatch = useAppDispatch();
  const { showError } = useMutationToast();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: checkEmail,
    onMutate: () => setError(null),
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
    onError: (mutationError) => {
      const message = "Could not verify this email. Please try again.";
      setError(message);
      showError(mutationError, message);
    },
  });

  const resetError = useCallback(() => setError(null), []);

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
  const { showError } = useMutationToast();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signupRegister(email, password),
    onMutate: () => setError(null),
    onSuccess: (_result, variables) => {
      dispatch(setPendingEmail(variables.email.trim().toLowerCase()));
      router.push({
        pathname: AUTH_ROUTE_PATHS.verifyEmail,
        params: { email: variables.email.trim().toLowerCase() },
      });
    },
    onError: (mutationError) => {
      const message = "Could not create your account. Please try again.";
      setError(message);
      showError(mutationError, message);
    },
  });

  const resetError = useCallback(() => setError(null), []);

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
  const { showError } = useMutationToast();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: sendOtp,
    onMutate: () => setError(null),
    onSuccess: (result) => {
      dispatch(setOtpSentAt(result.sentAt));
    },
    onError: (mutationError) => {
      const message = "Could not send verification code. Please try again.";
      setError(message);
      showError(mutationError, message);
    },
  });

  const resetError = useCallback(() => setError(null), []);

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
  const { showError } = useMutationToast();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      verifyOtp(email, otp),
    onMutate: () => setError(null),
    onSuccess: (session) => {
      dispatch(
        setCredentials({
          user: session.user,
          token: session.token,
          refreshToken: session.refreshToken,
        }),
      );
      router.replace(AUTH_ROUTES.home);
    },
    onError: (mutationError) => {
      const message = "Invalid verification code. Please try again.";
      setError(message);
      showError(mutationError, message);
    },
  });

  const resetError = useCallback(() => setError(null), []);

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
  const { showError } = useMutationToast();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onMutate: () => setError(null),
    onSuccess: (session) => {
      dispatch(
        setCredentials({
          user: session.user,
          token: session.token,
          refreshToken: session.refreshToken,
        }),
      );
      router.replace(AUTH_ROUTES.home);
    },
    onError: (mutationError) => {
      const message = "Invalid email or password.";
      setError(message);
      showError(mutationError, message);
    },
  });

  const resetError = useCallback(() => setError(null), []);

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
  const { showError } = useMutationToast();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      completeAccountSetup(token, password),
    onMutate: () => setError(null),
    onSuccess: (session) => {
      dispatch(
        setCredentials({
          user: session.user,
          token: session.token,
          refreshToken: session.refreshToken,
        }),
      );
      router.replace(AUTH_ROUTES.home);
    },
    onError: (mutationError) => {
      const message = "Invalid or expired setup link. Please contact your administrator.";
      setError(message);
      showError(mutationError, message);
    },
  });

  const resetError = useCallback(() => setError(null), []);

  return {
    completeAccountSetup: mutation.mutate,
    isPending: mutation.isPending,
    error,
    resetError,
  };
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const { showError } = useMutationToast();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      dispatch(logoutAction());
      router.replace(AUTH_ROUTES.login);
    },
    onError: (mutationError) => {
      dispatch(logoutAction());
      router.replace(AUTH_ROUTES.login);
      showError(mutationError, "Could not sign out cleanly.");
    },
  });
}
