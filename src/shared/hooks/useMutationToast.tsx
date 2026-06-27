import { useCallback } from "react";

import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/src/shared/components/ui/toast";
import { toApiError } from "@/src/shared/utils/apiClient";

export function useMutationToast() {
  const toast = useToast();

  const showError = useCallback(
    (error: unknown, fallbackMessage: string) => {
      const apiError = toApiError(error, fallbackMessage);
      console.error(`[API] ${apiError.message}`, error);

      toast.show({
        placement: "top",
        duration: 4000,
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="outline">
            <ToastTitle>Something went wrong</ToastTitle>
            <ToastDescription>{apiError.message}</ToastDescription>
          </Toast>
        ),
      });
    },
    [toast],
  );

  return { showError };
}