import { useRef, useEffect } from "react";
import { useDevToolsContext } from "../DevToolsContext";
import { StorageOperationsTable } from "./StorageOperationsTable";

export function EventsPage() {
  const { storageOperations } = useDevToolsContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const scrollBehaviorRef = useRef<ScrollBehavior>("auto");

  useEffect(() => {
    if (!hoveredRef.current) {
      containerRef.current?.scrollIntoView({ behavior: scrollBehaviorRef.current, block: "end" });
    }
    scrollBehaviorRef.current = "smooth";
  }, [storageOperations]);

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
      <StorageOperationsTable operations={storageOperations} />
    </div>
  );
}
