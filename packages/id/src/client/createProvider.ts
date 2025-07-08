import { Provider, RpcRequest, RpcResponse } from "ox";
import { connectRp } from "./connectRp";
import { createTimeout } from "../createTimeout";

export function createProvider({}: {} = {}) {
  const emitter = Provider.createEmitter();
  const store = RpcRequest.createStore();

  const { port: portPromise } = connectRp();

  const provider = Provider.from({
    ...emitter,
    async request(args) {
      console.log("provider.request", args);

      if (args.method === "wallet_connect") {
        console.log("got connect request, asking port");
        const port = await portPromise;

        await new Promise((resolve, reject) => {
          function onPortMessage(event: MessageEvent) {
            if (event.data === "createResult") {
              resolve({});
            }
          }
          port.addEventListener("message", onPortMessage);

          const timeout = createTimeout(5000);
          timeout.promise.finally(() => port.removeEventListener("message", onPortMessage));
          timeout.promise.catch(reject);

          port.postMessage("create");
        });
      }

      store.prepare(args as never);
      return RpcResponse.parse({});
    },
  });

  return { provider };
}
