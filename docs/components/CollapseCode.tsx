import { ReactNode, useRef, useEffect } from "react";

type Props = {
  children: ReactNode;
};

const css = `
.CollapseCode .line:not(highlighted,.near-highlighted) {
  opacity: 0;
  position: absolute;
}
.CollapseCode .line:not(.highlighted,.near-highlighted) + .line.near-highlighted {
  margin-top: 1em;
}
`;

export function CollapseCode({ children }: Props) {
  const ref = useRef<HTMLDivElement>();
  useEffect(() => {
    if (!ref.current) return;
    const lines = Array.from(ref.current.querySelectorAll(".line"));
    const highlightedPositions = [];
    const nearHighlightedPositions = [];
    lines.forEach((line, i) => {
      if (line.matches(".highlighted")) {
        highlightedPositions.push(i);
      }
    });
    highlightedPositions.forEach((position) => {
      const near = [position - 2, position - 1, position + 1, position + 2];
      near.forEach((n) => {
        if (n < 0) return;
        if (n >= lines.length) return;
        if (highlightedPositions.includes(n)) return;
        if (nearHighlightedPositions.includes(n)) return;
        nearHighlightedPositions.push(n);
      });
    });
    console.log("highlightedPositions", highlightedPositions);
    console.log("nearHighlightedPositions", nearHighlightedPositions);
    lines.forEach((line, i) => {
      if (nearHighlightedPositions.includes(i)) {
        line.classList.add("near-highlighted");
      }
    });
  }, []);
  return (
    <>
      <div ref={ref} style={{ marginTop: "1.5rem" }} className="CollapseCode">
        {children}
      </div>
      <style>{css}</style>
    </>
  );
}
