import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Notification } from "@/src/features/notifications/types";

export interface NotificationsState {
  items: Notification[];
  unreadCount: number;
}

function countUnread(items: Notification[]): number {
  return items.filter((item) => !item.read).length;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.items = action.payload;
      state.unreadCount = countUnread(action.payload);
    },
    markAllRead: (state) => {
      state.items = state.items.map((item) => ({ ...item, read: true }));
      state.unreadCount = 0;
    },
    incrementUnread: (state) => {
      state.unreadCount += 1;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const target = state.items.find((item) => item.id === action.payload);

      if (target && !target.read) {
        target.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
});

export const {
  setNotifications,
  markAllRead,
  incrementUnread,
  markNotificationRead,
} = notificationsSlice.actions;

export const selectNotificationsState = (state: {
  notifications: NotificationsState;
}) => state.notifications;
export const selectNotifications = (state: {
  notifications: NotificationsState;
}) => state.notifications.items;
export const selectUnreadCount = (state: {
  notifications: NotificationsState;
}) => state.notifications.unreadCount;

export default notificationsSlice.reducer;
