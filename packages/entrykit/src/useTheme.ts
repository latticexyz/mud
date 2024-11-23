import { useMediaQuery } from "usehooks-ts";
import { useEntryKitConfig } from "./EntryKitConfigProvider";

export function useTheme() {
  const { theme: initialTheme } = useEntryKitConfig();
  const darkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = initialTheme ?? (darkMode ? "dark" : "light");
  return theme;
}
