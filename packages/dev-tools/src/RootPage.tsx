import { Outlet } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { useDevToolsContext } from "./DevToolsContext";
import { NavButton } from "./NavButton";

export function RootPage() {
  const { recsWorld, hideActions, hideComponents, hideEvents, tabs } = useDevToolsContext();
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
        {!hideActions && (
          <NavButton
            to="/actions"
            className={({ isActive }) =>
              twMerge("py-1.5 px-3", isActive ? "bg-slate-800 text-white" : "hover:bg-blue-800 hover:text-white")
            }
          >
            Actions
          </NavButton>
        )}
        {!hideEvents && (
          <NavButton
            to="/events"
            className={({ isActive }) =>
              twMerge("py-1.5 px-3", isActive ? "bg-slate-800 text-white" : "hover:bg-blue-800 hover:text-white")
            }
          >
            Store log
          </NavButton>
        )}
        {recsWorld && !hideComponents ? (
          <NavButton
            to="/components"
            className={({ isActive }) =>
              twMerge("py-1.5 px-3", isActive ? "bg-slate-800 text-white" : "hover:bg-blue-800 hover:text-white")
            }
          >
            Components
          </NavButton>
        ) : null}
        {tabs?.map((tab) => (
          <NavButton
            key={tab.path}
            to={`/${tab.path}`}
            className={({ isActive }) =>
              twMerge("py-1.5 px-3", isActive ? "bg-slate-800 text-white" : "hover:bg-blue-800 hover:text-white")
            }
          >
            {tab.path}
          </NavButton>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </>
  );
}
