import { Transport } from "viem";
import { debug } from "./debug";

export function transportObserver<TTransport extends Transport>(name: string, transport: TTransport): TTransport {
  return ((opts) => {
    const result = transport(opts);
    const request: typeof result.request = async (req) => {
      debug("request", name, req);
      return result.request(req);
    };
    return {
      ...result,
      request,
    };
  }) as TTransport;
}
