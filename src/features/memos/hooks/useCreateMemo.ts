import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

import {
  createMemo,
  sendMemo,
} from "@/src/features/memos/api/memosApi";
import { memosKeys } from "@/src/features/memos/hooks/useMemos";
import type { CreateMemoPayload } from "@/src/features/memos/types/CreateMemoTypes";
import { useMutationToast } from "@/src/shared/hooks/useMutationToast";

export function useCreateMemo() {
  const queryClient = useQueryClient();
  const { showError } = useMutationToast();

  return useMutation({
    mutationFn: async (payload: CreateMemoPayload) => {
      const draft = await createMemo(payload);
      return sendMemo(draft.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memosKeys.lists() });
      router.back();
    },
    onError: (error) => {
      showError(error, "Could not publish this memo. Please try again.");
    },
  });
}
