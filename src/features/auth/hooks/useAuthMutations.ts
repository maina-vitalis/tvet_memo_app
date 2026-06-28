import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useState } from "react";

import {
  checkEmail,
  login,
  logout,
  sendOtp,
  setPassword,
  verifyOtp,
} from "@/src/features/auth/api/authApi";
import { AUTH_ROUTE_PATHS, AUTH_ROUTES } from "@/src/features/auth/navigation";
import {
  logout as logoutAction,
  setCredentials,
  setFirstSetup,
  setOtpSentAt,
  setPendingEmail,
  setPendingPassword,
  setVerifiedOtp,
} from "@/src/features/auth/store/authSlice";
import { useMutationToast } from "@/src/shared/hooks/useMutationToast";
import { getStore } from "@/src/shared/store/storeRef";
import { useAppDispatch } from "@/src/shared/store/hooks";

export function useCheckEmail() {
  const dispatch = useAppDispatch();
  const { showError } = useMutationToast();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: checkEmail,
    onMutate: () => setError(null),
    onSuccess: (result, email) => {
      if (!result.exists) {
        const message =
          "We could not find an account for this email at your institution.";
        setError(message);
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      dispatch(setFirstSetup(result.isFirstSetup));
      dispatch(setPendingEmail(normalizedEmail));

      router.push({
        pathname: AUTH_ROUTE_PATHS.password,
        params: { mode: result.isFirstSetup ? "setup" : "login" },
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
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const result = await verifyOtp(email, otp);

      if (!result.valid) {
        return { ...result, session: null };
      }

      const pendingPassword = getStore().getState().auth.pendingPassword;

      if (pendingPassword) {
        const session = await setPassword(email, pendingPassword, otp);
        return { ...result, session };
      }

      return { ...result, session: null };
    },
    onMutate: () => setError(null),
    onSuccess: (result, variables) => {
      if (!result.valid) {
        setError("Invalid verification code. Please try again.");
        return;
      }

      dispatch(setFirstSetup(result.isFirstSetup));
      dispatch(setVerifiedOtp(variables.otp));

      if (result.session) {
        dispatch(
          setCredentials({
            user: result.session.user,
            token: result.session.token,
            refreshToken: result.session.refreshToken,
          }),
        );
        router.replace(AUTH_ROUTES.home);
        return;
      }

      router.push({
        pathname: AUTH_ROUTE_PATHS.password,
        params: { mode: "login" },
      });
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

export function useSetPassword() {
  const dispatch = useAppDispatch();
  const { showError } = useMutationToast();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      setPassword(email, password),
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
      const message = "Could not set your password. Please try again.";
      setError(message);
      showError(mutationError, message);
    },
  });

  const resetError = useCallback(() => setError(null), []);

  return {
    setPassword: mutation.mutate,
    setPasswordAsync: mutation.mutateAsync,
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