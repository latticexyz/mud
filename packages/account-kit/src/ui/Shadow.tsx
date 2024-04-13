import { ReactNode, forwardRef, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { mergeRefs } from "react-merge-refs";
import css from "tailwindcss/tailwind.css?inline";

const sheet = new CSSStyleSheet();
sheet.replaceSync(css);

export type Props = {
  children: ReactNode;
};

export const Shadow = forwardRef<HTMLSpanElement, Props>(function Shadow({ children }, forwardedRef) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const root = container.attachShadow({ mode: "open", delegatesFocus: true });
    root.adoptedStyleSheets = [sheet];
    setShadowRoot(root);
  }, []);

  return (
    <span ref={mergeRefs([containerRef, forwardedRef])} style={{ display: "unset", outline: "none" }}>
      {shadowRoot ? ReactDOM.createPortal(children, shadowRoot) : null}
    </span>
  );
});
