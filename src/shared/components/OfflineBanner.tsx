import NetInfo from '@react-native-community/netinfo';
import { WifiOff, Wifi } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';

import { HStack } from '@/src/shared/components/ui/hstack';
import { Text } from '@/src/shared/components/ui/text';

type BannerState = 'hidden' | 'offline' | 'back-online';

/**
 * Global banner that slides down from the top when the device loses
 * connectivity, and briefly shows a "Back online" message when it reconnects.
 *
 * Subscribes directly to NetInfo and calls setState inside the subscription
 * callback — the pattern React 19 recommends for external system sync.
 */
export function OfflineBanner() {
  const [bannerState, setBannerState] = useState<BannerState>('hidden');
  const wasOfflineRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Clear any pending "back-online" dismiss timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (state.isConnected === false) {
        wasOfflineRef.current = true;
        setBannerState('offline');
      } else if (state.isConnected === true && wasOfflineRef.current) {
        wasOfflineRef.current = false;
        setBannerState('back-online');
        timerRef.current = setTimeout(() => setBannerState('hidden'), 3000);
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (bannerState === 'hidden') return null;

  const isOffline = bannerState === 'offline';

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(300)}
      style={[
        styles.container,
        isOffline ? styles.offlineBg : styles.onlineBg,
      ]}
    >
      <HStack className="items-center justify-center gap-2 px-4 py-2.5">
        {isOffline ? (
          <WifiOff size={16} color="#ffffff" strokeWidth={2.5} />
        ) : (
          <Wifi size={16} color="#ffffff" strokeWidth={2.5} />
        )}
        <Text className="text-sm font-semibold" style={styles.text}>
          {isOffline ? 'No internet connection' : 'Back online'}
        </Text>
      </HStack>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    ...Platform.select({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      web: { position: 'fixed' as any },
      default: {},
    }),
  },
  offlineBg: {
    backgroundColor: '#b45309', // amber-700
  },
  onlineBg: {
    backgroundColor: '#15803d', // green-700
  },
  text: {
    color: '#ffffff',
  },
});

