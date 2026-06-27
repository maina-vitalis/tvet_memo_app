import { GluestackUIProvider } from "@/src/shared/components/ui/gluestack-ui-provider";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <GluestackUIProvider>{children}</GluestackUIProvider>;
}
