import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { router } from "expo-router";

import type { LocalMemoAttachment } from "@/src/features/memos/components/MemoAttachmentPicker";
import {
  createMemo,
  publishMemo,
  publishMemoWithAttachments,
} from "@/src/features/memos/api/memosApi";
import { memosKeys } from "@/src/features/memos/hooks/useMemos";
import type { CreateMemoPayload } from "@/src/features/memos/types/CreateMemoTypes";
import { notificationsKeys } from "@/src/features/notifications/queryKeys";
import { useMutationToast } from "@/src/shared/hooks/useMutationToast";

export type MemoComposerInput = CreateMemoPayload & {
  publishNow?: boolean;
  attachments?: LocalMemoAttachment[];
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
      const {
        publishNow: _publishNow,
        attachments = [],
        ...createPayload
      } = payload;

      if (payload.publishNow === false) {
        return createMemo(createPayload);
      }

      if (attachments.length > 0) {
        return publishMemoWithAttachments(createPayload, attachments);
      }

      return publishMemo(createPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.list() });
      router.back();
    },

    onError: (error, variables) => {
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
          : `Could not publish this memo. Please try again.${timeoutHint}`;

      showError(error, fallback);
    },
  });

  return mutation;
}
