import { ReactNode, forwardRef, useEffect, useReducer, useRef } from "react";
import ReactDOM from "react-dom";
import css from "tailwindcss/tailwind.css?inline";

const sheet = new CSSStyleSheet();
sheet.replaceSync(css);

export type Props = {
  children: ReactNode;
};

export const Shadow = forwardRef<HTMLDivElement, Props>(function Shadow({ children }, forwardedRef) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const [, forceUpdate] = useReducer(() => ({}), {});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (shadowRef.current) return;

    const root = container.attachShadow({ mode: "open", delegatesFocus: true });
    root.adoptedStyleSheets = [sheet];
    shadowRef.current = root;
    forceUpdate();
  }, []);

  return (
    <div ref={forwardedRef} style={{ all: "initial" }}>
      <div ref={containerRef}>{shadowRef.current ? ReactDOM.createPortal(children, shadowRef.current) : null}</div>
    </div>
  );
});
