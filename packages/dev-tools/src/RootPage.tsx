import { twMerge } from "tailwind-merge";
import { Outlet } from "react-router-dom";
import { NavButton } from "./NavButton";

export function RootPage() {
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
