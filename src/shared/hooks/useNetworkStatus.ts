import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * Lightweight hook that tracks device connectivity.
 * Uses @react-native-community/netinfo which works on Android, iOS, and web.
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected };
}
