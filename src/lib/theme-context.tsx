import { StatusBar } from "expo-status-bar";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  GluestackUIProvider,
  type ModeType,
} from "@/src/components/ui/gluestack-ui-provider";

type ThemeContextValue = {
  mode: ModeType;
  isDarkMode: boolean;
  setThemeMode: (mode: ModeType) => void;
  toggleDarkMode: (enabled: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemedStatusBar() {
  // const { isDarkMode } = useTheme();

  return <StatusBar style={"auto"} />;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ModeType>("light");

  const setThemeMode = useCallback((nextMode: ModeType) => {
    setMode(nextMode);
  }, []);

  const toggleDarkMode = useCallback((enabled: boolean) => {
    setMode(enabled ? "dark" : "light");
  }, []);

  const value = useMemo(
    () => ({
      mode,
      isDarkMode: mode === "dark",
      setThemeMode,
      toggleDarkMode,
    }),
    [mode, setThemeMode, toggleDarkMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <GluestackUIProvider mode={mode}>
        {children}
        <ThemedStatusBar />
      </GluestackUIProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
