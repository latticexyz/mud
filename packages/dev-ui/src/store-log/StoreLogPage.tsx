import { useRef, useEffect } from "react";
import { useNetworkStore } from "../useNetworkStore";
import { StoreEventsTable } from "./StoreEventsTable";

export function StoreLogPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const storeEvents = useNetworkStore((state) => state.storeEvents);

  useEffect(() => {
    if (!containerRef.current) return;
    if (hoveredRef.current) return;
    containerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [storeEvents]);

  return (
    <div
      ref={containerRef}
      className="px-2 pb-1"
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
    >
      <StoreEventsTable storeEvents={storeEvents} />
    </div>
  );
}
