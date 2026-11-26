import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;

    Network.getNetworkStateAsync()
      .then((state) => {
        if (mounted) {
          setIsOnline(state.isConnected !== false && state.isInternetReachable !== false);
        }
      })
      .catch(() => {});

    const subscription = Network.addNetworkStateListener((state) => {
      if (mounted) {
        setIsOnline(state.isConnected !== false && state.isInternetReachable !== false);
      }
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return { isOnline };
}
