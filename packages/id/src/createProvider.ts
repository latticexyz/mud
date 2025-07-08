import { Provider, RpcRequest, RpcResponse } from "ox";

export function createProvider() {
  const emitter = Provider.createEmitter();
  const store = RpcRequest.createStore();

  const provider = Provider.from({
    ...emitter,
    async request(args) {
      console.log("provider.request", args);
      store.prepare(args as never);
      return RpcResponse.parse({});
    },
  });

  return { provider };
}
