import { debug } from "../debug";
import { methods } from "./methods";
import { RequestData, ResponseData } from "./schema";

export function onPostMessage(event: MessageEvent<"bridge:connect">) {
  console.log("got postmessage", event);
  if (event.data === "bridge:connect") {
    debug("bridge:connect", event);
    const [port] = event.ports;
    if (!port) return console.warn('Got "bridge:connect" message with no message port.');

    debug("attaching onPortMessage");
    port.addEventListener("message", onPortMessage);
    port.start();
    // TODO: detect support and emit a different message?
    port.postMessage("bridge:connected");
  }
}

function reply<method extends keyof methods>(port: MessagePort, data: Extract<ResponseData, { method: method }>) {
  debug("replying", data);
  port.postMessage(data);
}

async function onPortMessage(event: MessageEvent<RequestData>) {
  debug("onPortMessage", event);
  const port = event.target;
  if (!(port instanceof MessagePort)) return debug("event.target is not a MessagePort, ignoring");

  if (event.data.method === "create") {
    debug("calling", event.data);
    try {
      const result = await methods.create();
      reply(port, {
        id: event.data.id,
        method: event.data.method,
        result,
      });
    } catch (error) {
      console.error("[mud id error]", error);
      reply(port, {
        id: event.data.id,
        method: event.data.method,
        // TODO: send the whole error object back, should be fine
        error: {
          message: error instanceof Error ? `${error.message}\n\n${error.stack}` : String(error),
        },
      });
    }
  } else if (event.data.method === "sign") {
    debug("calling", event.data);
    try {
      const result = await methods.sign(...event.data.params);
      reply(port, {
        id: event.data.id,
        method: event.data.method,
        result,
      });
    } catch (error) {
      console.error("[mud id error]", error);
      reply(port, {
        id: event.data.id,
        method: event.data.method,
        // TODO: send the whole error object back, should be fine
        error: {
          message: error instanceof Error ? `${error.message}\n\n${error.stack}` : String(error),
        },
      });
    }
  }
}
