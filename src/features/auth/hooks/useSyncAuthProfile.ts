import { useEffect } from "react";

import { setUser } from "@/src/features/auth/store/authSlice";
import { selectIsAuthenticated } from "@/src/features/auth/store/authSelectors";
import { useProfileQuery } from "@/src/features/profile/hooks/useProfile";
import { useAppDispatch, useAppSelector } from "@/src/shared/store/hooks";

/** Keeps Redux auth user in sync with /auth/me so RBAC checks use the real role. */
export function useSyncAuthProfile() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: profile } = useProfileQuery();

  useEffect(() => {
    if (!isAuthenticated || !profile) {
      return;
    }

    dispatch(setUser(profile));
  }, [dispatch, isAuthenticated, profile]);
}
