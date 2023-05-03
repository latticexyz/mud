import { useRef, useEffect } from "react";
import { useStore } from "../useStore";
import { StoreEventsTable } from "./StoreEventsTable";

export function StoreLogPage() {
  const storeEvents = useStore((state) => state.storeEvents);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const scrollBehaviorRef = useRef<ScrollBehavior>("auto");

  useEffect(() => {
    if (!hoveredRef.current) {
      containerRef.current?.scrollIntoView({ behavior: scrollBehaviorRef.current, block: "end" });
    }
    scrollBehaviorRef.current = "smooth";
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
