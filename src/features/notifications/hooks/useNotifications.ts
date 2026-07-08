import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getNotifications,
  markNotificationRead,
} from "@/src/features/notifications/api/notificationsApi";
import {
  markNotificationRead as markNotificationReadAction,
  setNotifications,
} from "@/src/features/notifications/store/notificationsSlice";
import type { Notification } from "@/src/features/notifications/types";
import { selectIsAuthenticated } from "@/src/features/auth/store/authSelectors";
import { useMutationToast } from "@/src/shared/hooks/useMutationToast";
import { useAppDispatch, useAppSelector } from "@/src/shared/store/hooks";

export const notificationsKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationsKeys.all, "list"] as const,
};

export function useNotificationsQuery() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { showError } = useMutationToast();

  const query = useQuery({
    queryKey: notificationsKeys.list(),
    queryFn: getNotifications,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (query.data) {
      dispatch(setNotifications(query.data));
    }
  }, [dispatch, query.data]);

  useEffect(() => {
    if (query.error) {
      showError(query.error, "Could not load notifications. Please try again.");
    }
  }, [query.error, showError]);

  return query;
}

export function useMarkRead() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { showError } = useMutationToast();

  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.list() });

      const previous = queryClient.getQueryData<Notification[]>(
        notificationsKeys.list(),
      );

      if (previous) {
        const optimistic = previous.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item,
        );
        queryClient.setQueryData(notificationsKeys.list(), optimistic);
        dispatch(setNotifications(optimistic));
        dispatch(markNotificationReadAction(notificationId));
      }

      return { previous };
    },
    onError: (error, _notificationId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationsKeys.list(), context.previous);
        dispatch(setNotifications(context.previous));
      }

      showError(error, "Could not mark notification as read.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.list() });
    },
  });
}