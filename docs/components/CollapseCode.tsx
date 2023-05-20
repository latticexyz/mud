import { ReactNode, useRef, useEffect, useState } from "react";
import styles from "./CollapseCode.module.css";

type Props = {
  children: ReactNode;
};

export function CollapseCode({ children }: Props) {
  const ref = useRef<HTMLDivElement>();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!ref.current) return;
    const lines = Array.from(ref.current.querySelectorAll(".line"));
    const highlightedPositions = [];
    lines.forEach((line, i) => {
      if (line.matches(".highlighted")) {
        highlightedPositions.push(i);
      }
      if (/^\s+$/g.test(line.innerHTML)) {
        line.setAttribute("data-empty", "");
      }
    });
    if (!highlightedPositions.length) return;
    lines.forEach((line, i) => {
      const distance = highlightedPositions.reduce((min, pos) => Math.min(min, Math.abs(pos - i)), Infinity);
      line.setAttribute("data-highlight-distance", Math.min(distance, 4).toString());
    });
  }, [collapsed]);

  return (
    <div
      ref={ref}
      style={{ marginTop: "1.5rem" }}
      className={collapsed ? styles.collapsed : styles.expanded}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest(".line")) {
          setCollapsed(!collapsed);
        }
      }}
    >
      {children}
    </div>
  );
}
