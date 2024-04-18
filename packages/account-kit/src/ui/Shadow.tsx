import { CSSProperties, HTMLProps, ReactNode, forwardRef, useRef, useState } from "react";
import ReactDOM from "react-dom";
import css from "tailwindcss/tailwind.css?inline";
import { useMediaQuery, useResizeObserver } from "usehooks-ts";
import { useConfig } from "../AccountKitProvider";
import { mergeRefs } from "react-merge-refs";
import { FrameProvider } from "./FrameProvider";

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
  return <div ref={ref} {...props} style={{ ...props.style, display: "inline-block" }} />;
}

// TODO: make a container inside the iframe that is at least the size of the window, render content into that so we can correctly measure size relative to window
//       otherwise as the iframe shrinks, the measurement will be based on that shrunk value and it'll never get bigger, only smaller

export const Shadow = forwardRef<HTMLIFrameElement, Props>(function Shadow({ mode, children }, forwardedRef) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const frame = loaded ? frameRef.current : null;

  const [frameSize, setFrameSize] = useState<{ width: number | undefined; height: number | undefined }>({
    width: undefined,
    height: undefined,
  });

  const { theme: initialTheme } = useConfig();
  const darkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = initialTheme ?? (darkMode ? "dark" : "light");

  const modeStyle: CSSProperties =
    mode === "modal"
      ? { display: "block", position: "fixed", inset: "0", width: "100vw", height: "100vh", zIndex: "2147483646" }
      : frameSize.width && frameSize.height
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
    <iframe
      ref={mergeRefs([forwardedRef, frameRef])}
      style={{ border: "0", ...modeStyle }}
      onLoad={() => setLoaded(true)}
      srcDoc="<!doctype html><title>…</title>"
    >
      {frame?.contentDocument
        ? ReactDOM.createPortal(
            <FrameProvider frame={frame}>
              {mode === "modal" ? (
                <div data-theme={theme}>{children}</div>
              ) : (
                <Resizer data-theme={theme} onSize={setFrameSize}>
                  {children}
                </Resizer>
              )}
              <style dangerouslySetInnerHTML={{ __html: css }} />
            </FrameProvider>,
            frame.contentDocument.body,
          )
        : null}
    </iframe>
  );
});
