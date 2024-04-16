import { ReactNode, forwardRef, useEffect, useReducer, useRef } from "react";
import ReactDOM from "react-dom";
import css from "tailwindcss/tailwind.css?inline";
import { useMediaQuery } from "usehooks-ts";
import { useConfig } from "../AccountKitProvider";

const sheet = new CSSStyleSheet();
sheet.replaceSync(css);

export type Props = {
  children: ReactNode;
};

export const Shadow = forwardRef<HTMLDivElement, Props>(function Shadow({ children }, forwardedRef) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const [, forceUpdate] = useReducer(() => ({}), {});

  const { theme: initialTheme } = useConfig();
  const darkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = initialTheme ?? (darkMode ? "dark" : "light");

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
    <div ref={forwardedRef} style={{ all: "initial", display: "inline-block" }}>
      <div ref={containerRef} style={{ display: "inline-block" }}>
        {shadowRef.current
          ? ReactDOM.createPortal(
              <div data-theme={theme} style={{ display: "inline-block" }}>
                {children}
              </div>,
              shadowRef.current,
            )
          : null}
      </div>
    </div>
  );
});
