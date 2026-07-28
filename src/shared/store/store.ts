import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";

import authReducer from "@/src/features/auth/store/authSlice";
import memosReducer from "@/src/features/memos/store/memosSlice";
import notificationsReducer from "@/src/features/notifications/store/notificationsSlice";
import { registerStore } from "./storeRef";

// AsyncStorage is not encrypted, so tokens must never be persisted here.
// Access/refresh tokens live in SecureStore only and are restored into memory
// on cold start by loadTokensFromSecureStorage().
const authPersistConfig = {
  key: "auth",
  storage: AsyncStorage,
  whitelist: ["user"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  memos: memosReducer,
  notifications: notificationsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

registerStore(store);

export type AppStore = typeof store;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
