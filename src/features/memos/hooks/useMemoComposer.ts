import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { router } from "expo-router";

import { createMemo, publishMemo } from "@/src/features/memos/api/memosApi";
import { memosKeys } from "@/src/features/memos/hooks/useMemos";
import type { CreateMemoPayload } from "@/src/features/memos/types/CreateMemoTypes";
import { notificationsKeys } from "@/src/features/notifications/queryKeys";
import { useMutationToast } from "@/src/shared/hooks/useMutationToast";

export type MemoComposerInput = CreateMemoPayload & {
  publishNow?: boolean;
};

function isTimeoutError(error: unknown): boolean {
  return (
    isAxiosError(error) &&
    (error.code === "ECONNABORTED" || error.message.includes("timeout"))
  );
}

export function useMemoComposer() {
  const queryClient = useQueryClient();
  const { showError } = useMutationToast();

  const mutation = useMutation({
    mutationFn: async (payload: MemoComposerInput) => {
      const { publishNow: _publishNow, ...createPayload } = payload;

      if (payload.publishNow === false) {
        return createMemo(createPayload);
      }

      return publishMemo(createPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.list() });
      router.back();
    },

    onError: (error, variables) => {
      // Refresh feeds even on failure — the server may have committed the send
      // while the client timed out waiting for the response.
      void queryClient.invalidateQueries({ queryKey: memosKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: notificationsKeys.list(),
      });

      const timeoutHint = isTimeoutError(error)
        ? " The request timed out — check your feed before trying again to avoid sending duplicates."
        : "";

      const fallback =
        variables.publishNow === false
          ? "Could not save this draft. Please try again."
          : variables.scheduledAt
            ? "Could not schedule this memo. Please try again."
            : `Could not publish this memo. Please try again.${timeoutHint}`;

      showError(error, fallback);
    },
  });

  return mutation;
}
