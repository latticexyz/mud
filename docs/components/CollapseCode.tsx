import { ReactNode, useRef, useEffect } from "react";

type Props = {
  children: ReactNode;
};

export function CollapseCode({ children }: Props) {
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    if (!ref.current) return;
    const lines = Array.from(ref.current.querySelectorAll(".line"));
    const highlightedPositions = [];
    lines.forEach((line, i) => {
      if (line.matches(".highlighted")) {
        highlightedPositions.push(i);
      }
    });
    if (!highlightedPositions.length) return;
    lines.forEach((line, i) => {
      const distance = highlightedPositions.reduce((min, pos) => Math.min(min, Math.abs(pos - i)), Infinity);
      if (distance >= 4) {
        line.style.position = "absolute";
        line.style.opacity = "0";
        line.style.pointerEvents = "none";
      } else if (distance === 3) {
        line.style.opacity = "0.3";
      } else if (distance === 2) {
        line.style.opacity = "0.6";
      }
    });
  }, []);
  return (
    <div ref={ref} style={{ marginTop: "1.5rem" }}>
      {children}
    </div>
  );
}
