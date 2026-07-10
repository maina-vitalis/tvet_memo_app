import { useEffect } from "react";

import { setUser } from "@/src/features/auth/store/authSlice";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/src/features/auth/store/authSelectors";
import { useProfileQuery } from "@/src/features/profile/hooks/useProfile";
import { useAppDispatch, useAppSelector } from "@/src/shared/store/hooks";

/** Keeps Redux auth user in sync with /auth/me so RBAC checks use the real role. */
export function useSyncAuthProfile() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authUser = useAppSelector(selectCurrentUser);
  const { data: profile } = useProfileQuery();

  useEffect(() => {
    if (!isAuthenticated || !profile || !authUser) {
      return;
    }

    if (profile.id !== authUser.id) {
      return;
    }

    dispatch(setUser(profile));
  }, [dispatch, isAuthenticated, authUser, profile]);
}
