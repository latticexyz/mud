import { wait } from "@latticexyz/common/utils";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

export type Props = {
  error?: Error;
  retry?: () => unknown | Promise<unknown>;
};

export function ErrorOverlay({ error, retry }: Props) {
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
          error ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={twMerge(
          "absolute inset-0",
          "transition duration-300",
          error ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
        )}
      >
        {error ? (
          <div className="pointer-events-auto w-full max-h-full bg-blue-700 text-white/70 overflow-auto">
            <div className="space-y-6 p-8 pb-0">
              <div className="text-white text-lg font-bold sticky top-0 left-0">Oops! It broke :(</div>
              <div className="space-y-2">
                <div className="font-mono text-xs whitespace-pre-wrap">{error.message.trim()}</div>
                <div className="text-sm">See the console for more info.</div>
              </div>
            </div>
            <div className="pointer-events-none sticky bottom-0 left-0 -mt-6">
              <div className="w-full h-16 bg-gradient-to-b from-transparent to-blue-700" />
              {retry ? (
                <div className="bg-blue-700 p-2 text-center">
                  <button
                    type="button"
                    className={twMerge(
                      "pointer-events-auto group px-2 py-1 transition",
                      "bg-blue-600 hover:bg-blue-500 aria-busy:bg-blue-500",
                      "text-white uppercase text-sm font-bold",
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
                    <span className="group-aria-busy:hidden">Retry?</span>
                    <span className="hidden group-aria-busy:inline">Retrying…</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
