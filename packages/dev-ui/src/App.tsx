import "./preflight.css";
import "tailwindcss/tailwind.css";
import { twMerge } from "tailwind-merge";
import { Outlet } from "react-router-dom";
import { NavButton } from "./NavButton";

// TODO: error boundary to catch route errors and any other downstream errors
//       might need to move router provider in here instead of in mount.tsx and wrap the whole thing in an error boundary

export function App() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-screen-sm h-full absolute right-0 bg-slate-800 text-slate-300 text-sm flex flex-col">
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
  );
}
