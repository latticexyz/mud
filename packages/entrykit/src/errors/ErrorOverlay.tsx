import { wait } from "@latticexyz/common/utils";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

export type Props = {
  error?: Error;
  dismiss?: () => unknown;
  retry?: () => unknown | Promise<unknown>;
};

export function ErrorOverlay({ error, retry, dismiss }: Props) {
  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-clip">
      <div
        className={twMerge(
          "absolute inset-0 bg-blue-700/60",
          "transition duration-300",
          error ? "opacity-100 pointer-events-auto" : "opacity-0",
        )}
      />
      <div
        className={twMerge(
          "absolute inset-0 pb-8",
          "transition duration-300",
          error ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-4 opacity-0",
        )}
      >
        {error ? (
          <>
            <div className="w-full max-h-full bg-blue-700 text-white/80 overflow-auto">
              <div className="space-y-6 px-8 pt-8">
                <div className="text-white text-lg font-bold">Oops! It broke :(</div>
                <div className="font-mono text-xs whitespace-pre-wrap">{error.message.trim()}</div>
                <div className="text-sm">See the console for more info.</div>
              </div>
              <div className="pointer-events-none sticky bottom-0 left-0 -mt-2">
                <div className="w-full h-12 bg-gradient-to-b from-transparent to-blue-700" />
                {retry ? (
                  <div className="bg-blue-700 text-center">
                    {/* TODO: replace with AsyncButton */}
                    <button
                      type="button"
                      className={twMerge(
                        "pointer-events-auto group w-24 p-1 -translate-y-2 transition",
                        "bg-blue-600 hover:bg-blue-500 aria-busy:bg-blue-500",
                        "text-white text-sm font-medium",
                        "aria-busy:pointer-events-none",
                      )}
                      onClick={async (event) => {
                        // if we retry and the same error occurs, it'll look like the button click did nothing
                        // so we'll fake a pending state here to give users an indication something is happening
                        event.currentTarget.ariaBusy = "true";
                        await wait(500);
                        retry();
                        if (event.currentTarget) {
                          event.currentTarget.ariaBusy = null;
                        }
                      }}
                    >
                      {/* TODO: swap with pending icon */}
                      <span className="group-aria-busy:hidden">Retry</span>
                      <span className="hidden group-aria-busy:inline">Retrying…</span>
                    </button>
                  </div>
                ) : dismiss ? (
                  <div className="bg-blue-700 text-center">
                    {/* TODO: replace with AsyncButton */}
                    <button
                      type="button"
                      className={twMerge(
                        "pointer-events-auto group w-24 p-1 -translate-y-2 transition",
                        "bg-blue-600 hover:bg-blue-500 aria-busy:bg-blue-500",
                        "text-white text-sm font-medium",
                        "aria-busy:pointer-events-none",
                      )}
                      onClick={dismiss}
                    >
                      Dismiss
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
