import { StoreEvents } from "./StoreEvents";
import "./preflight.css";
import "tailwindcss/tailwind.css";

export function App() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="pointer-events-auto w-80 h-full absolute right-0 bg-white shadow-lg overflow-auto">
        Store events
        <StoreEvents />
      </div>
    </div>
  );
}
