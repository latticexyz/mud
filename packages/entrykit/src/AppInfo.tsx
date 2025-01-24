import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { Logo } from "./icons/Logo";
import { usePreloadImage } from "./usePreloadImage";

export function AppInfo() {
  const { appName, appIcon } = useEntryKitConfig();
  const { data: hasAppIcon, isLoading: appIconLoading } = usePreloadImage(appIcon);

  return (
    <div className="flex-grow flex flex-col items-center justify-center gap-2">
      <div className="w-16 h-16 m-2">
        {!appIconLoading ? (
          hasAppIcon ? (
            <img src={appIcon} className="w-full h-full object-cover" />
          ) : (
            // TODO: swap with favicon
            <Logo className="w-full h-full text-orange-500 dark:bg-neutral-800" />
          )
        ) : null}
      </div>
      <div className="text-2xl text-white text-center">{appName}</div>
    </div>
  );
}
