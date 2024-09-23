import { Transport } from "viem";
import { debug } from "./debug";

export function transportObserver<TTransport extends Transport>(name: string, transport: TTransport): TTransport {
  return ((opts) => {
    const result = transport(opts);
    const request: typeof result.request = async (req) => {
      debug("request", name, req);
      // console.trace(`[${name}] ${req.method}`);
      const response = await result.request(req);
      debug("response", name, response);
      return response as never;
    };
    return {
      ...result,
      request,
    };
  }) as TTransport;
}
