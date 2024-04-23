import { useMediaQuery } from "usehooks-ts";
import { useConfig } from "./AccountKitConfigProvider";

export function useTheme() {
  const { theme: initialTheme } = useConfig();
  const darkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = initialTheme ?? (darkMode ? "dark" : "light");
  return theme;
}
