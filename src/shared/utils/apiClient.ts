import {
  create,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { router } from "expo-router";

import { AUTH_ROUTES } from "@/src/features/auth/navigation";
import { logout } from "@/src/features/auth/store/authSlice";
import { getStore } from "@/src/shared/store/storeRef";
import type { ApiError } from "@/src/shared/types";
import { API_BASE_URL } from "@/src/shared/utils/config";
import { isAxiosError } from "axios";

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

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStore().getState().auth.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (__DEV__) {
    const method = (config.method ?? "get").toUpperCase();
    const path = config.url ?? "";
    console.log(`[API] ${method} ${API_BASE_URL}${path}`);
  }

  return config;
});

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
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    if (error.response?.status === 401) {
      const store = getStore();
      store.dispatch(logout());
      router.replace(AUTH_ROUTES.login);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
