import { Transport } from "viem";

export function mudTransportWrapper<TTransport extends Transport>(transport: TTransport): TTransport {
  console.log("wrapped transport", transport);
  return ((opts) => {
    const result = transport(opts);
    console.log("got wrapped result", result, opts);
    const wrappedRequest: typeof result.request = (req) => {
      console.log("got request", req);
      return result.request(req);
    };
    return {
      ...result,
      request: wrappedRequest,
    };
  }) as TTransport;
}
