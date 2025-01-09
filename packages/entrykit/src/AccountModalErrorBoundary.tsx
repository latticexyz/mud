import { ReactNode, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorNotice } from "./ErrorNotice";
import { wait } from "@latticexyz/common/utils";
import { twMerge } from "tailwind-merge";
import { useIsMounted } from "usehooks-ts";
import { PendingIcon } from "./icons/PendingIcon";

export type Props = {
  children: ReactNode;
};

export function AccountModalErrorBoundary({ children }: Props) {
  const isMounted = useIsMounted();
  const [retries, setRetries] = useState(1);

  // TODO: invalidate query cache?

  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className={twMerge("flex-grow flex flex-col justify-center p-5 gap-2")}>
          <ErrorNotice error={error instanceof Error ? error.stack ?? error.message : error} />
          {retries > 0 ? (
            <button
              type="button"
              onClick={async (event) => {
                // if we retry and the same error occurs, it'll look like the button click did nothing
                // so we'll fake a pending state here to give users an indication something is happening
                event.currentTarget.ariaBusy = "true";
                await wait(1000);
                resetErrorBoundary();
                if (isMounted()) {
                  setRetries((value) => value - 1);
                  event.currentTarget.ariaBusy = null;
                }
              }}
              className="group aria-busy:pointer-events-none self-end flex items-center gap-1"
            >
              <PendingIcon className="transition opacity-0 group-aria-busy:opacity-100 text-xs text-neutral-500 dark:text-neutral-400" />
              <span className="text-sm text-neutral-500 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white">
                Retry?
              </span>
            </button>
          ) : null}
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
