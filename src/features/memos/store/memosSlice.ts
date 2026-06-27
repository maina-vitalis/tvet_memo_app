import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Memo } from "@/src/features/memos/types";

export type MemosSyncStatus = "idle" | "syncing" | "error";

export interface MemosState {
  items: Memo[];
  selectedId: string | null;
  syncStatus: MemosSyncStatus;
  lastSyncAt: number | null;
}

const initialState: MemosState = {
  items: [],
  selectedId: null,
  syncStatus: "idle",
  lastSyncAt: null,
};

const memosSlice = createSlice({
  name: "memos",
  initialState,
  reducers: {
    setMemos: (state, action: PayloadAction<Memo[]>) => {
      state.items = action.payload;
    },
    selectMemo: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },
    setSyncStatus: (state, action: PayloadAction<MemosSyncStatus>) => {
      state.syncStatus = action.payload;
    },
    updateLastSync: (state, action: PayloadAction<number>) => {
      state.lastSyncAt = action.payload;
    },
  },
});

export const { setMemos, selectMemo, setSyncStatus, updateLastSync } =
  memosSlice.actions;

export const selectMemosState = (state: { memos: MemosState }) => state.memos;
export const selectMemos = (state: { memos: MemosState }) => state.memos.items;
export const selectSelectedMemoId = (state: { memos: MemosState }) =>
  state.memos.selectedId;
export const selectSelectedMemo = (state: { memos: MemosState }) =>
  state.memos.items.find((memo) => memo.id === state.memos.selectedId) ?? null;
export const selectMemosSyncStatus = (state: { memos: MemosState }) =>
  state.memos.syncStatus;
export const selectLastSyncAt = (state: { memos: MemosState }) =>
  state.memos.lastSyncAt;

export default memosSlice.reducer;
