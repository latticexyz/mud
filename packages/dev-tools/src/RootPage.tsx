import { twMerge } from "tailwind-merge";
import { Outlet } from "react-router-dom";
import { NavButton } from "./NavButton";
import { useDevToolsContext } from "./DevToolsContext";

export function RootPage() {
  const { recsWorld, useStore } = useDevToolsContext();
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
        {useStore ? (
          <NavButton
            to="/tables"
            className={({ isActive }) =>
              twMerge("py-1.5 px-3", isActive ? "bg-slate-800 text-white" : "hover:bg-blue-800 hover:text-white")
            }
          >
            Tables
          </NavButton>
        ) : null}
        {recsWorld ? (
          <NavButton
            to="/components"
            className={({ isActive }) =>
              twMerge("py-1.5 px-3", isActive ? "bg-slate-800 text-white" : "hover:bg-blue-800 hover:text-white")
            }
          >
            Components
          </NavButton>
        ) : null}
      </div>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </>
  );
}
