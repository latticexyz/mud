import "./preflight.css";
import "tailwindcss/tailwind.css";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Outlet } from "react-router-dom";
import { NavButton } from "./NavButton";

// TODO: error boundary to catch route errors and any other downstream errors
//       might need to move router provider in here instead of in mount.tsx and wrap the whole thing in an error boundary

// TODO: fix tab index so that it's not possible to tab around in the UI when it's hidden

export function RootPage() {
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
    <>
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
          to="/events"
          className={({ isActive }) =>
            twMerge("py-1.5 px-3", isActive ? "bg-slate-800 text-white" : "hover:bg-blue-800 hover:text-white")
          }
        >
          Store log
        </NavButton>
        <NavButton
          to="/tables"
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
    </>
  );
}
