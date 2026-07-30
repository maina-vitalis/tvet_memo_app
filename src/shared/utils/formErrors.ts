import { isAxiosError } from "axios";

import { toApiError } from "@/src/shared/utils/apiClient";

export function getFormErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && !error.response) {
    return "Could not reach the server. Check your connection and try again.";
  }

  const { message, statusCode } = toApiError(error, fallback);

  if (statusCode >= 500 && message === fallback) {
    return "Something went wrong on our end. Please try again later.";
  }

  return message;
}
