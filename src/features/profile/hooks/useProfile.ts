import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getProfile,
  updateMyProfile,
} from "@/src/features/profile/api/profileApi";
import { selectIsAuthenticated } from "@/src/features/auth/store/authSelectors";
import { setUser } from "@/src/features/auth/store/authSlice";
import { useMutationToast } from "@/src/shared/hooks/useMutationToast";
import { useAppDispatch, useAppSelector } from "@/src/shared/store/hooks";

export const profileKeys = {
  all: ["profile"] as const,
  detail: (userId?: string | null) =>
    [...profileKeys.all, userId ?? "anonymous"] as const,
};

export function useProfileQuery() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userId = useAppSelector((state) => state.auth.user?.id);
  const { showError } = useMutationToast();

  const query = useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: getProfile,
    enabled: isAuthenticated && Boolean(userId),
  });

  useEffect(() => {
    if (query.error) {
      showError(query.error, "Could not load your profile. Please try again.");
    }
  }, [query.error, showError]);

  return query;
}

/** Edits name/phone/avatar together as a single PATCH — see updateMyProfile(). */
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { showError } = useMutationToast();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(
        profileKeys.detail(updatedUser.id),
        updatedUser,
      );
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      dispatch(setUser(updatedUser));
    },
    onError: (error) => {
      showError(error, "Could not update your profile. Please try again.");
    },
  });
}
