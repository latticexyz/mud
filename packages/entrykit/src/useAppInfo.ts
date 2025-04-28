export function useAppInfo() {
  // const { appInfo } = useConfig(); TODO: resolve
  const appName = "AccountKit";
  const appOrigin = location.host;
  const appIcon = "/favico.ico";
  const appImage = "/favico.ico";

  return { appName, appOrigin, appIcon, appImage };

  // TODO: resolve
  // const appName = appInfo?.name ?? document.title;
  // // TODO: should origin be set in config and validated against current host?
  // const appOrigin = location.host;
  // const appIcon = appInfo?.icon ?? document.querySelector("link[rel~='icon']")?.getAttribute("href") ?? "/favico.ico";
  // const appImage = appInfo?.image;

  // return { appName, appOrigin, appIcon, appImage };
}
