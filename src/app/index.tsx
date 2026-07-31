import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

import { getHasSeenWelcome } from "@/src/features/auth/storage/onboardingStorage";

export default function IndexScreen() {
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    void getHasSeenWelcome().then((seen) => {
      if (isMounted) {
        setHasSeenWelcome(seen);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (hasSeenWelcome === null) {
    return null;
  }

  return (
    <Redirect
      href={
        hasSeenWelcome ? "/(auth)/tenant-discovery" : "/(auth)/welcome"
      }
    />
  );
}
