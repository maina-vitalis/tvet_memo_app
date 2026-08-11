import { WifiOff, Wifi } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';

import { useNetworkStatus } from '@/src/shared/hooks/useNetworkStatus';
import { HStack } from '@/src/shared/components/ui/hstack';
import { Text } from '@/src/shared/components/ui/text';

type BannerState = 'hidden' | 'offline' | 'back-online';

/**
 * Global banner that slides down from the top when the device loses
 * connectivity, and briefly shows a "Back online" message when it reconnects.
 */
export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const [bannerState, setBannerState] = useState<BannerState>('hidden');
  const wasOfflineRef = useRef<boolean>(false);

  useEffect(() => {
    if (isConnected === false) {
      wasOfflineRef.current = true;
      setBannerState('offline');
    } else if (isConnected === true && wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setBannerState('back-online');
      const timer = setTimeout(() => setBannerState('hidden'), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

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
      web: { position: 'fixed' as unknown as undefined },
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
