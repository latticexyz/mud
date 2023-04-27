import { StoreEvents } from "./StoreEvents";
import "./preflight.css";
import "tailwindcss/tailwind.css";

export function App() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-screen-sm h-full absolute right-0 bg-slate-800 text-slate-300 text-sm flex flex-col">
        <div className="flex-none bg-slate-900">
          <button type="button" className="py-1.5 px-3 bg-slate-800">
            Store log
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <StoreEvents />
        </div>
      </div>
    </div>
  );
}
