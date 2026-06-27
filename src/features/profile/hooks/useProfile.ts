import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getProfile,
  updateProfile,
} from "@/src/features/profile/api/profileApi";
import type { User } from "@/src/shared/types";
import { selectIsAuthenticated } from "@/src/features/auth/store/authSelectors";
import { useMutationToast } from "@/src/shared/hooks/useMutationToast";
import { useAppSelector } from "@/src/shared/store/hooks";

export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};

export function useProfileQuery() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { showError } = useMutationToast();

  const query = useQuery({
    queryKey: profileKeys.detail(),
    queryFn: getProfile,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (query.error) {
      showError(query.error, "Could not load your profile. Please try again.");
    }
  }, [query.error, showError]);

  return query;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { showError } = useMutationToast();

  return useMutation({
    mutationFn: (data: Partial<User>) => updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(profileKeys.detail(), updatedUser);
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
    onError: (error) => {
      showError(error, "Could not update your profile. Please try again.");
    },
  });
}