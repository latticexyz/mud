import { wait } from "@latticexyz/common/utils";
import { useEffect, useRef, useState } from "react";
import { FallbackProps } from "react-error-boundary";

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const when = new Date();
  const isMounted = useRef(false);
  const [retries, setRetries] = useState(1);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  });

  return (
    <div className="fixed inset-0 overflow-auto bg-red-50">
      <div className="w-full max-w-screen-md mx-auto py-16 px-8 space-y-12">
        <h1 className="text-4xl font-black text-red-500">Oops! It broke :(</h1>
        <div className="space-y-6">
          <div className="relative">
            <div className="p-6 bg-red-100 border-l-8 -ml-[8px] border-red-500 font-semibold whitespace-pre-wrap">
              {error instanceof Error ? error.message : String(error)}
            </div>
            {error instanceof Error && error.stack ? (
              <div className="p-6 bg-white font-mono text-sm overflow-auto whitespace-pre">{error.stack}</div>
            ) : null}
            <div className="absolute top-full right-0 text-sm text-stone-400" title={when.toISOString()}>
              {when.toLocaleString()}
            </div>
          </div>

          {retries > 0 ? (
            <button
              type="button"
              className="group bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 active:bg-red-700 transition aria-busy:pointer-events-none aria-busy:animate-pulse"
              onClick={async (event) => {
                // if we retry and the same error occurs, it'll look like the button click did nothing
                // so we'll fake a pending state here to give users an indication something is happening
                event.currentTarget.ariaBusy = "true";
                await wait(1000);
                resetErrorBoundary();
                if (isMounted.current) {
                  setRetries((value) => value - 1);
                  event.currentTarget.ariaBusy = null;
                }
              }}
            >
              <span className="group-aria-busy:hidden">Retry?</span>
              <span className="hidden group-aria-busy:inline">Retrying…</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
