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

  const frameStyle: CSSProperties =
    mode === "modal"
      ? {
          all: "unset",
          display: "block",
          position: "fixed",
          inset: "0",
          width: "100vw",
          height: "100vh",
          zIndex: "2147483646",
        }
      : frameSize.width && frameSize.height
        ? {
            all: "unset",
            display: "inline-block",
            width: `${frameSize.width}px`,
            height: `${frameSize.height}px`,
            boxShadow: "0 0 0 4px red",
          }
        : {
            all: "unset",
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
      style={frameStyle}
      onLoad={() => setLoaded(true)}
      srcDoc="<!doctype html><title>…</title>"
    >
      {frame?.contentDocument
        ? ReactDOM.createPortal(
            <FrameProvider frame={frame}>
              {/*
               * TODO: make this the size of the outer window so that any container-based resizing in iframe
               *       is done from that rather than the potentially-small size of this iframe
               */}
              <div data-theme={theme}>
                {mode === "modal" ? children : <Resizer onSize={setFrameSize}>{children}</Resizer>}
              </div>
              <style dangerouslySetInnerHTML={{ __html: css }} />
            </FrameProvider>,
            frame.contentDocument.body,
          )
        : null}
    </iframe>
  );
});
