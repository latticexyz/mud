import { ReactNode, useRef } from "react";

export type Props = {
  className?: string;
  children: ReactNode;
  enabled?: boolean;
};

export function KeepInView({ className, children, enabled = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const scrollBehaviorRef = useRef<ScrollBehavior>("auto");

  // Intentionally not in a `useEffect` so this triggers on every render.
  if (!hoveredRef.current && enabled) {
    containerRef.current?.scrollIntoView({
      behavior: scrollBehaviorRef.current,
      block: "end",
      inline: "end",
    });
  }
  scrollBehaviorRef.current = "smooth";

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
      className={className}
    >
      {children}
    </div>
  );
}
