import { Hex, RpcRequest, RpcResponse, RpcSchema } from "ox";
import { Store } from "ox/RpcRequest";
import { debug } from "../debug";
import { methods } from "./methods";
import { from as fromRpcResponse } from "ox/RpcResponse";

export type Schema = RpcSchema.From<{
  Request: {
    method: "create";
  };
  ReturnType: {
    id: string;
    publicKey: Hex.Hex;
  };
}>;

export type Request = RpcRequest.RpcRequest<Schema>;
export type Response = fromRpcResponse.Response<Request>;

export const store: Store<Schema> = RpcRequest.createStore<Schema>();
export const parse = <request extends Request>(response: unknown, request: request) =>
  RpcResponse.parse(response, { request, raw: true });

export function onPostMessage(event: MessageEvent<unknown>) {
  if (event.data === "bridge:connect") {
    debug("bridge:connect", event);
    const [port] = event.ports;
    if (!port) return console.warn('Got "bridge:connect" message with no message port.');

    debug("attaching onPortMessage");
    port.addEventListener("message", onPortMessage);
    port.start();
    port.postMessage("bridge:connected");
  }
}

function reply(port: MessagePort, data: Response) {
  debug("replying", data);
  port.postMessage(data);
}

async function onPortMessage(event: MessageEvent<Request>) {
  const port = event.target;
  if (!(port instanceof MessagePort)) return debug("event.target is not a MessagePort, ignoring");

  const request = event.data;
  debug("request", request);

  if (request.method === "create") {
    try {
      const result = await methods.create();
      reply(port, {
        jsonrpc: "2.0",
        id: event.data.id,
        result,
      });
    } catch (error) {
      console.error("[smartpass error]", error);
      reply(port, {
        jsonrpc: "2.0",
        id: event.data.id,
        error: {
          code: 0,
          message: String(error),
        },
      });
    }
  }
}
