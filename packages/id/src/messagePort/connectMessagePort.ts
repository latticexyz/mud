import { defer } from "../defer";
import { initialMessage, initialMessageShape } from "./common";

export async function connectMessagePort({
  id,
  target,
  context,
}: {
  id: string;
  target: Window;
  context?: unknown;
}): Promise<MessagePort> {
  const deferred = defer<MessagePort>();

  function onWindowMessage(event: MessageEvent) {
    if (event.source !== target) return;
    if (!initialMessageShape.allows(event.data)) return;
    if (event.data.id !== id) return;

    const [port] = event.ports;
    if (!port) {
      deferred.reject(new Error("Got initial message with no message port."));
      return;
    }

    port.start();
    port.postMessage(initialMessageShape.from({ ...initialMessage, id, context }));

    deferred.resolve(port);
  }

  window.addEventListener("message", onWindowMessage);
  deferred.promise.finally(() => {
    window.removeEventListener("message", onWindowMessage);
  });

  return deferred.promise;
}
