import "./preflight.css";
import "tailwindcss/tailwind.css";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { router } from "./router";
import { RouterProvider } from "react-router-dom";
import useLocalStorageState from "use-local-storage-state";

// TODO: fix tab index so that it's not possible to tab around in the UI when it's hidden

export function App() {
  const [shown, setShown] = useLocalStorageState("mud-dev-tools-shown", {
    defaultValue: true,
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "`") {
        setShown(!shown);
      }
    };
    window.addEventListener("keypress", listener);
    return () => window.removeEventListener("keypress", listener);
  });

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div
        className={twMerge(
          "pointer-events-auto w-full max-w-screen-sm h-full absolute right-0",
          "transition duration-500",
          shown ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="absolute bottom-0 right-full min-w-max flex flex-col-reverse items-end justify-center m-2 text-gray-500">
          <button
            type="button"
            className="peer text-sm p-2 rounded leading-none transition opacity-60 hover:opacity-100"
            onClick={() => setShown(!shown)}
          >
            <span className="whitespace-nowrap font-medium">{shown ? "→" : "←"} MUD Dev Tools</span>
          </button>
          <span className="transition opacity-0 peer-hover:opacity-60 px-2 text-xs flex items-center justify-center gap-2">
            Keyboard shortcut
            <code className="bg-gray-500/10 p-1 rounded text-mono text-xs leading-none">`</code>
          </span>
        </div>
        <div
          className={twMerge(
            "w-full h-full bg-slate-800 text-white/80 text-sm flex flex-col",
            "transition duration-500",
            shown ? "opacity-100" : "opacity-0"
          )}
        >
          <RouterProvider router={router} />
        </div>
      </div>
    </div>
  );
}
