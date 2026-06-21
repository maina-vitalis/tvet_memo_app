import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import {
  SafeAreaListener,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import '@/global.css';
import { GluestackUIProvider } from '@/src/components/ui/gluestack-ui-provider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaListener
        onChange={({ insets }) => {
          Uniwind.updateInsets(insets);
        }}
      >
        <GluestackUIProvider mode="system">
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
          <StatusBar style="auto" />
        </GluestackUIProvider>
      </SafeAreaListener>
    </SafeAreaProvider>
  );
}
