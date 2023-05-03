import { useRef, useEffect } from "react";
import { useStore } from "../useStore";
import { TransactionSummary } from "./TransactionSummary";

export function ActionsPage() {
  const transactions = useStore((state) => state.transactions);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const scrollBehaviorRef = useRef<ScrollBehavior>("auto");

  useEffect(() => {
    if (!hoveredRef.current) {
      containerRef.current?.scrollIntoView({ behavior: scrollBehaviorRef.current, block: "end" });
    }
    scrollBehaviorRef.current = "smooth";
  }, [transactions]);

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
      {transactions.map((hash) => (
        <TransactionSummary key={hash} hash={hash} />
      ))}
    </div>
  );
}
