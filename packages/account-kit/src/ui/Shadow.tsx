import { CSSProperties, HTMLProps, ReactNode, forwardRef, useRef, useState } from "react";
import ReactDOM from "react-dom";
import css from "tailwindcss/tailwind.css?inline";
import { useMediaQuery, useResizeObserver } from "usehooks-ts";
import { useConfig } from "../AccountKitProvider";
import { mergeRefs } from "react-merge-refs";

export type Props = {
  mode: "modal" | "child";
  children: ReactNode;
};

function Resizer({
  onSize,
  ...props
}: {
  onSize: (size: { width: number | undefined; height: number | undefined }) => void;
} & HTMLProps<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement | null>(null);
  useResizeObserver({ ref, onResize: onSize });
  return <div ref={ref} style={{ ...props.style, display: "inline-block" }} {...props} />;
}

export const Shadow = forwardRef<HTMLIFrameElement, Props>(function Shadow({ mode, children }, forwardedRef) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null);

  const { theme: initialTheme } = useConfig();
  const darkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = initialTheme ?? (darkMode ? "dark" : "light");

  const modeStyle: CSSProperties =
    mode === "modal"
      ? { display: "block", position: "fixed", inset: "0", width: "100vw", height: "100vh", zIndex: "2147483646" }
      : frameSize
        ? { display: "inline-block", width: `${frameSize.width}px`, height: `${frameSize.height}px` }
        : {
            display: "block",
            position: "fixed",
            inset: "0",
            width: "100vw",
            height: "100vh",
            opacity: 0,
            pointerEvents: "none",
          };

  return (
    <iframe ref={mergeRefs([forwardedRef, frameRef])} style={{ border: "0", ...modeStyle }}>
      {frameRef.current
        ? ReactDOM.createPortal(
            <>
              {mode === "modal" ? (
                <div data-theme={theme}>{children}</div>
              ) : (
                <Resizer
                  data-theme={theme}
                  onSize={({ width, height }) => {
                    if (width != null && height != null) {
                      setFrameSize({ width, height });
                    }
                  }}
                >
                  {children}
                </Resizer>
              )}
              <style dangerouslySetInnerHTML={{ __html: css }} />
            </>,
            frameRef.current.contentWindow!.document.body,
          )
        : null}
    </iframe>
  );
});
