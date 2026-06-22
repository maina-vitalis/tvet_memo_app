import { StatusBar } from "expo-status-bar";

import { GluestackUIProvider } from "@/src/components/ui/gluestack-ui-provider";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <GluestackUIProvider>
      {children}
      <StatusBar style="dark" />
    </GluestackUIProvider>
  );
}
