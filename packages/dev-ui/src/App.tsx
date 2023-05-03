import "./preflight.css";
import "tailwindcss/tailwind.css";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Outlet } from "react-router-dom";
import { NavButton } from "./NavButton";

// TODO: error boundary to catch route errors and any other downstream errors
//       might need to move router provider in here instead of in mount.tsx and wrap the whole thing in an error boundary

// TODO: fix tab index so that it's not possible to tab around in the UI when it's hidden

export function App() {
  const [shown, setShown] = useState(true);

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
        <div className="absolute bottom-0 right-full min-w-max flex flex-col-reverse items-end justify-center m-2">
          <button
            type="button"
            className="peer text-sm p-2 rounded leading-none transition opacity-60 hover:opacity-100"
            onClick={() => setShown(!shown)}
          >
            <span className="whitespace-nowrap font-medium">{shown ? "→" : "←"} MUD Dev UI</span>
          </button>
          <span className="transition opacity-0 peer-hover:opacity-40 px-2 text-xs flex items-center justify-center gap-2">
            Keyboard shortcut
            <code className="bg-black/10 p-1 rounded text-mono text-xs leading-none">`</code>
          </span>
        </div>
        <div
          className={twMerge(
            "w-full h-full bg-slate-800 text-white/80 text-sm flex flex-col",
            "transition duration-500",
            shown ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex-none bg-slate-900 text-white/60 font-medium">
            <NavButton
              to="/"
              className={({ isActive }) =>
                twMerge("py-1.5 px-3", isActive ? "bg-slate-800 text-white" : "hover:bg-blue-800 hover:text-white")
              }
            >
              Summary
            </NavButton>
            <NavButton
              to="/actions"
              className={({ isActive }) =>
                twMerge("py-1.5 px-3", isActive ? "bg-slate-800 text-white" : "hover:bg-blue-800 hover:text-white")
              }
            >
              Actions
            </NavButton>
            <NavButton
              to="/store-log"
              className={({ isActive }) =>
                twMerge("py-1.5 px-3", isActive ? "bg-slate-800 text-white" : "hover:bg-blue-800 hover:text-white")
              }
            >
              Store log
            </NavButton>
            <NavButton
              to="/store-data"
              className={({ isActive }) =>
                twMerge("py-1.5 px-3", isActive ? "bg-slate-800 text-white" : "hover:bg-blue-800 hover:text-white")
              }
            >
              Store data
            </NavButton>
          </div>
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
