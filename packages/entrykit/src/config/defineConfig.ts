import { EntryKitConfigInput } from "./input";
import { EntryKitConfig } from "./output";

export function defineConfig(input: EntryKitConfigInput): EntryKitConfig {
  return {
    ...input,
    appName: input.appName ?? document.title,
    appIcon: input.appIcon ?? document.querySelector("link[rel~='icon']")?.getAttribute("href") ?? "/favico.ico",
  };
}
