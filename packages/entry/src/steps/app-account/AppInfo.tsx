import { Logo } from "../../icons/Logo";
import { useAppInfo } from "../../useAppInfo";
import { usePreloadImage } from "../../usePreloadImage";

export function AppInfo() {
  const { appName, appOrigin, appIcon } = useAppInfo();

  const { data: hasAppIcon, isLoading: appIconLoading } = usePreloadImage(appIcon);

  // TODO: add "already signed" state

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 gap-2">
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
      <div className="flex flex-col gap-1 items-center justify-center">
        <div className="text-2xl">{appName}</div>
        <div className="text-sm font-mono text-neutral-400">{appOrigin}</div>
      </div>
    </div>
  );
}
