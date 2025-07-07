import { initialMessageShape, version } from "./common";

// Ideally we'd have one `onRequest` handler, but unfortunately I couldn't figure out how
// to get strong types, where narrowing on the RPC method would also narrow the params and
// enforce the method's specific return type.
//
// Instead, we have a map of `handlers`, where each RPC method is implemented as its own
// handler function.

export function connectMessagePort({
  target,
  context,
  onPort,
}: {
  target: Window;
  context?: unknown;
  onPort: (port: MessagePort) => void;
}): () => void {
  let connectedPort: MessagePort | undefined;

  function onWindowMessage(event: MessageEvent) {
    if (event.source !== target) return;
    if (!initialMessageShape.allows(event.data)) return;

    const [port] = event.ports;
    if (!port) {
      console.warn("Got initial message with no message port.");
      return;
    }

    // close existing port and replace with new one
    connectedPort?.close();
    connectedPort = port;

    port.start();
    port.postMessage(
      initialMessageShape.from({
        mudId: version,
        context,
      }),
    );

    onPort(port);
  }

  window.addEventListener("message", onWindowMessage);
  return () => {
    window.removeEventListener("message", onWindowMessage);
    connectedPort?.close();
  };
}
