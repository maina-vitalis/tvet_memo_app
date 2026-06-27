import type { AppStore } from "./store";

let storeInstance: AppStore | null = null;

export function registerStore(store: AppStore) {
  storeInstance = store;
}

export function getStore(): AppStore {
  if (!storeInstance) {
    throw new Error("Redux store has not been registered yet.");
  }

  return storeInstance;
}