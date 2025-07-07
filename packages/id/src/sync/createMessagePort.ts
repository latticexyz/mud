import { debug } from "../debug";
import { defer } from "../defer";
import { createTimeout } from "../createTimeout";
import { initialMessageShape, version } from "./common";
import { MessagePortUnexpectedInitialMessageError } from "./errors";

export type CreateMessagePortOptions = {
  target: Window;
  targetOrigin?: string;
  context?: unknown;
};

export type CreateMessagePortResult = {
  readonly port: MessagePort;
  readonly initialMessage: typeof initialMessageShape.infer;
};

export async function createMessagePort({
  target,
  targetOrigin = "*",
  context,
}: CreateMessagePortOptions): Promise<CreateMessagePortResult> {
  const timeout = createTimeout(500);

  const result = defer<CreateMessagePortResult>();
  const channel = new MessageChannel();
  channel.port1.addEventListener(
    "message",
    function onMessage(event) {
      debug("got message from port", event);
      if (initialMessageShape.allows(event.data)) {
        result.resolve({ port: channel.port1, initialMessage: event.data });
      } else {
        result.reject(new MessagePortUnexpectedInitialMessageError());
      }
    },
    { once: true, signal: timeout.signal },
  );
  channel.port1.start();

  debug("establishing MessagePort with", targetOrigin);
  target.postMessage(
    initialMessageShape.from({
      mudId: version,
      context,
    }),
    targetOrigin,
    [channel.port2],
  );

  return await Promise.race([result.promise, timeout.promise]);
}
