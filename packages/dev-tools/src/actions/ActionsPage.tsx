import { useRef, useEffect } from "react";
import { WriteSummary } from "./WriteSummary";
import { useDevToolsContext } from "../DevToolsContext";

export function ActionsPage() {
  const { writes } = useDevToolsContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const scrollBehaviorRef = useRef<ScrollBehavior>("auto");

  useEffect(() => {
    if (!hoveredRef.current) {
      containerRef.current?.scrollIntoView({ behavior: scrollBehaviorRef.current, block: "end" });
    }
    scrollBehaviorRef.current = "smooth";
  }, [writes]);

  return (
    <div
      ref={containerRef}
      className="p-4 space-y-2"
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
    >
      {writes.length ? (
        writes.map((write) => <WriteSummary key={write.id} write={write} />)
      ) : (
        <>Waiting for transactions…</>
      )}
    </div>
  );
}
