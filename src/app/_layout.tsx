import { QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import {
  SafeAreaListener,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Uniwind } from "uniwind";

import "@/global.css";
import { useAppfonts } from "@/src/shared/hooks/useAppfonts";
import { queryClient } from "@/src/shared/store/queryClient";
import { persistor, store } from "@/src/shared/store/store";
import AppBootstrap from "../shared/components/Appbootstrap";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useAppfonts();

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <SafeAreaListener
              onChange={({ insets }) => {
                Uniwind.updateInsets(insets);
              }}
            >
              <AppBootstrap />
            </SafeAreaListener>
          </SafeAreaProvider>
        </PersistGate>
      </QueryClientProvider>
    </Provider>
  );
}
