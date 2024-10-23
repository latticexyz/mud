import { useEntryKitConfig } from "./EntryKitConfigProvider";

export function useAppInfo() {
  const { appInfo } = useEntryKitConfig();

  const appName = appInfo?.name ?? document.title;
  // TODO: should origin be set in config and validated against current host?
  const appOrigin = location.host;
  const appIcon = appInfo?.icon ?? document.querySelector("link[rel~='icon']")?.getAttribute("href") ?? "/favico.ico";
  const appImage = appInfo?.image;

  return { appName, appOrigin, appIcon, appImage };
}