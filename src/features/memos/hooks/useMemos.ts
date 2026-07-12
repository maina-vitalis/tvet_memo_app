import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";

import {
  acknowledgeMemo,
  getMemoById,
  getMemos,
  isValidMemoId,
} from "@/src/features/memos/api/memosApi";
import type { Memo } from "@/src/features/memos/types";
import { setMemos } from "@/src/features/memos/store/memosSlice";
import { selectIsAuthenticated } from "@/src/features/auth/store/authSelectors";
import { useMutationToast } from "@/src/shared/hooks/useMutationToast";
import { useAppDispatch, useAppSelector } from "@/src/shared/store/hooks";

const DEFAULT_LIMIT = 20;

export const memosKeys = {
  all: ["memos"] as const,
  lists: () => [...memosKeys.all, "list"] as const,
  list: (page: number) => [...memosKeys.lists(), page] as const,
  details: () => [...memosKeys.all, "detail"] as const,
  detail: (id: string) => [...memosKeys.details(), id] as const,
};

export function useMemosQuery(page = 1) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { showError } = useMutationToast();

  const query = useInfiniteQuery({
    queryKey: memosKeys.lists(),
    initialPageParam: page,
    queryFn: ({ pageParam }) => getMemos(pageParam, DEFAULT_LIMIT),
    enabled: isAuthenticated,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      const maxPage = Math.ceil(lastPage.total / lastPage.limit);
      return nextPage <= maxPage ? nextPage : undefined;
    },
  });

  useEffect(() => {
    if (!query.data) {
      return;
    }

    const merged = query.data.pages.flatMap((pageResult) => pageResult.data);
    dispatch(setMemos(merged));
  }, [dispatch, query.data]);

  useEffect(() => {
    if (query.error) {
      showError(query.error, "Could not load memos. Please try again.");
    }
  }, [query.error, showError]);

  return query;
}

export function useMemoDetail(id: string) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { showError } = useMutationToast();

  const query = useQuery({
    queryKey: memosKeys.detail(id),
    queryFn: () => getMemoById(id),
    enabled: isAuthenticated && isValidMemoId(id),
  });

  useEffect(() => {
    if (query.error) {
      showError(query.error, "Could not load this memo. Please try again.");
    }
  }, [query.error, showError]);

  return query;
}

export function useAcknowledgeMemo() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { showError } = useMutationToast();

  return useMutation({
    mutationFn: acknowledgeMemo,
    onSuccess: (_result, memoId) => {
      queryClient.setQueryData<Memo>(memosKeys.detail(memoId), (current) =>
        current ? { ...current, isAcknowledged: true } : current,
      );

      queryClient.invalidateQueries({ queryKey: memosKeys.lists() });

      const cachedPages = queryClient.getQueryData<{
        pages: {
          data: Memo[];
          total: number;
          page: number;
          limit: number;
        }[];
      }>(memosKeys.lists());

      if (cachedPages) {
        const merged = cachedPages.pages.flatMap(
          (pageResult) => pageResult.data,
        );
        dispatch(setMemos(merged));
      }
    },
    onError: (error) => {
      showError(error, "Could not acknowledge this memo. Please try again.");
    },
  });
}
