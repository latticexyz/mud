import { ReactNode, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import css from "tailwindcss/tailwind.css?inline";

export type Props = {
  children: ReactNode;
};

export function Shadow({ children }: Props) {
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    if (placeholderRef.current) {
      const root = placeholderRef.current.attachShadow({ mode: "open", delegatesFocus: true });
      setShadowRoot(root);
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      root.adoptedStyleSheets = [sheet];
    }
  }, []);

  return (
    <div ref={placeholderRef} style={{ display: "unset" }}>
      {shadowRoot ? ReactDOM.createPortal(children, shadowRoot) : null}
    </div>
  );
}
