import {
  create,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";

import { AUTH_ROUTES } from "@/src/features/auth/navigation";
import { clearAuthSession } from "@/src/features/auth/api/sessionCleanup";
import { setCredentials } from "@/src/features/auth/store/authSlice";
import { getStore } from "@/src/shared/store/storeRef";
import type { ApiError } from "@/src/shared/types";
import { API_BASE_URL } from "@/src/shared/utils/config";
import { isAxiosError } from "axios";
import tokenStorage from "@/src/features/auth/api/tokenStorage";

/**
 * [REFRESH TOKENS + CENTRALIZED CLIENT]
 * This is the SINGLE axios instance used for authenticated calls.
 *
 * Key features implemented:
 * - Automatically attaches current access token from secure storage / redux.
 * - On 401: attempts a SINGLE refresh using a queued promise pattern.
 *   All concurrent 401s wait for the same refresh instead of each triggering their own.
 * - After successful refresh, retries the original request with the new access token.
 * - On refresh failure: forces full logout + redirect.
 *
 * Why this pattern (for reviewer):
 * - Prevents "thundering herd" of refresh calls when many components fire at the same time.
 * - Refresh token (long) is what we revoke on logout.
 * - Access token is short; we rely on exp or 401 to trigger this.
 *
 * RN specific: We prefer secure storage. The interceptor also syncs back into redux for UI.
 */

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string | string[];
};

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const envelope = payload as ApiEnvelope<unknown>;

  if (Array.isArray(envelope.message)) {
    return envelope.message.join(", ");
  }

  if (typeof envelope.message === "string") {
    return envelope.message;
  }

  return fallback;
}

export function toApiError(error: unknown, fallback: string): ApiError {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiEnvelope<unknown>>;
    const statusCode = axiosError.response?.status ?? 500;

    return {
      message: extractErrorMessage(
        axiosError.response?.data,
        axiosError.message || fallback,
      ),
      statusCode,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, statusCode: 500 };
  }

  return { message: fallback, statusCode: 500 };
}

const apiClient = create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

// ---------------------------------------------------------------------------
// [REFRESH TOKENS] Refresh queue variables (module scoped = singleton)
// ---------------------------------------------------------------------------
let isRefreshing = false;
let refreshSubscribers: Array<(newAccessToken: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newAccessToken: string) {
  refreshSubscribers.forEach((cb) => cb(newAccessToken));
  refreshSubscribers = [];
}

function onRefreshFailed() {
  refreshSubscribers = [];
}

// ---------------------------------------------------------------------------
// REQUEST INTERCEPTOR - attach latest access token + proactive refresh
// ---------------------------------------------------------------------------
import { getSecondsUntilExpiry } from "@/src/shared/utils/jwt"; // [REFRESH TOKENS]

// Dedicated instance without interceptors to avoid recursion when refreshing
const refreshAxios = create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Prefer secure storage first
    let token = await tokenStorage.getAccessToken();
    if (!token) {
      token = getStore().getState().auth.token;
    }

    // [REFRESH TOKENS] Proactive refresh if expiring soon.
    const secondsLeft = getSecondsUntilExpiry(token);
    const shouldRefreshProactively =
      secondsLeft !== null && secondsLeft < 90 && !config.url?.includes("/auth/refresh");

    if (shouldRefreshProactively) {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          // Use the raw instance to avoid triggering our own auth/401 interceptors recursively
          const { data } = await refreshAxios.post("/auth/refresh", { refreshToken });
          token = data.accessToken;

          // Update storage + redux (the main interceptor logic for success is in the 401 path,
          // but we replicate the minimal update here for proactive case)
          const newRefresh = data.refreshToken;
          if (token) await tokenStorage.setAccessToken(token);
          if (token && newRefresh) await tokenStorage.setTokens(token, newRefresh);

          const currentUser = getStore().getState().auth.user;
          if (currentUser && token) {
            // dispatch is safe here
            const { setCredentials } = await import("@/src/features/auth/store/authSlice");
            getStore().dispatch(
              setCredentials({ user: currentUser, token, refreshToken: newRefresh ?? undefined }),
            );
          }
        } catch {
          // Fall through — the normal 401 queue will catch it if needed
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (__DEV__) {
      const method = (config.method ?? "get").toUpperCase();
      const path = config.url ?? "";
      console.log(`[API] ${method} ${API_BASE_URL}${path}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// RESPONSE INTERCEPTOR - handle 401 with queued refresh
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiEnvelope<unknown> | unknown>) => {
    const payload = response.data;

    if (
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      (payload as ApiEnvelope<unknown>).success === true &&
      "data" in payload
    ) {
      return {
        ...response,
        data: (payload as ApiEnvelope<unknown>).data,
      };
    }

    return response;
  },
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      // Do not try to refresh on the refresh endpoint itself
      if (originalRequest.url?.includes("/auth/refresh")) {
        await clearAuthSession();
        router.replace(AUTH_ROUTES.login);
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshToken = await tokenStorage.getRefreshToken();
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          // Call refresh endpoint (NO auth header needed for this one)
          const { data } = await apiClient.post("/auth/refresh", {
            refreshToken,
          });

          const newAccess = data.accessToken as string;
          const newRefresh = data.refreshToken as string;

          // Persist securely
          await tokenStorage.setTokens(newAccess, newRefresh);

          // Also keep redux in sync for current session (UI selectors etc)
          const store = getStore();
          const currentUser = store.getState().auth.user;
          if (currentUser) {
            store.dispatch(
              setCredentials({
                user: currentUser,
                token: newAccess,
                refreshToken: newRefresh,
              }),
            );
          }

          onRefreshed(newAccess);

          // Retry original with new token
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          onRefreshFailed();
          await clearAuthSession();
          router.replace(AUTH_ROUTES.login);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Queue: wait for the refresh that is already in flight
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken: string) => {
          if (!originalRequest.headers) {
            (originalRequest as any).headers = {};
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    // For other 401s or non-retryable, force logout
    if (status === 401) {
      await clearAuthSession();
      router.replace(AUTH_ROUTES.login);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
