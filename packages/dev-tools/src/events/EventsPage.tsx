import { useRef, useEffect } from "react";
import { useStore } from "../useStore";
import { EventsTable } from "./EventsTable";

export function EventsPage() {
  const events = useStore((state) => state.storeEvents);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const scrollBehaviorRef = useRef<ScrollBehavior>("auto");

  useEffect(() => {
    if (!hoveredRef.current) {
      containerRef.current?.scrollIntoView({ behavior: scrollBehaviorRef.current, block: "end" });
    }
    scrollBehaviorRef.current = "smooth";
  }, [events]);

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
      <EventsTable events={events} />
    </div>
  );
}
