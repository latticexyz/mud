import { initialMessage, initialMessageShape } from "./common";

// TODO: rather than `onPort`, abstract over it with `onMessage` so we can allow the underlying port to change?

export function connectMessagePort({
  id,
  target,
  context,
  onPort,
}: {
  id: string;
  target: Window;
  context?: unknown;
  onPort: (port: MessagePort) => void;
}): () => void {
  let connectedPort: MessagePort | undefined;

  function onWindowMessage(event: MessageEvent) {
    if (event.source !== target) return;
    if (!initialMessageShape.allows(event.data)) return;
    if (event.data.id !== id) return;

    const [port] = event.ports;
    if (!port) {
      console.warn("Got initial message with no message port.");
      return;
    }

    // close existing port and replace with new one
    connectedPort?.close();
    connectedPort = port;

    port.start();
    port.postMessage(initialMessageShape.from({ ...initialMessage, id, context }));

    onPort(port);
  }

  window.addEventListener("message", onWindowMessage);
  return () => {
    window.removeEventListener("message", onWindowMessage);
    connectedPort?.close();
  };
}
