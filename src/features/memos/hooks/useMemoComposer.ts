import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

import { createMemo, sendMemo } from "@/src/features/memos/api/memosApi";
import { memosKeys } from "@/src/features/memos/hooks/useMemos";
import type { CreateMemoPayload } from "@/src/features/memos/types/CreateMemoTypes";
import { useMutationToast } from "@/src/shared/hooks/useMutationToast";

export type MemoComposerInput = CreateMemoPayload & {
  publishNow?: boolean;
};

function shouldSendImmediately(payload: MemoComposerInput): boolean {
  if (payload.publishNow === false) {
    return false;
  }

  if (!payload.scheduledAt) {
    return true;
  }

  const scheduledAt = new Date(payload.scheduledAt);

  return (
    !Number.isNaN(scheduledAt.getTime()) && scheduledAt.getTime() <= Date.now()
  );
}

export function useMemoComposer() {
  const queryClient = useQueryClient();
  const { showError } = useMutationToast();

  const mutation = useMutation({
    mutationFn: async (payload: MemoComposerInput) => {
      const { publishNow: _publishNow, ...createPayload } = payload;
      const memo = await createMemo(createPayload);

      if (shouldSendImmediately(payload)) {
        return sendMemo(memo.id);
      }

      return memo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memosKeys.lists() });
      router.back();
    },
    onError: (error, variables) => {
      const fallback =
        variables.publishNow === false
          ? "Could not save this draft. Please try again."
          : variables.scheduledAt
            ? "Could not schedule this memo. Please try again."
            : "Could not publish this memo. Please try again.";

      showError(error, fallback);
    },
  });

  return mutation;
}
