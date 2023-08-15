import { Hex, Transport, keccak256 } from "viem";
import { debug as parentDebug } from "./debug";

const debug = parentDebug.extend("transportObserver");

export function transportObserver<TTransport extends Transport>(transport: TTransport): TTransport {
  return ((opts) => {
    const result = transport(opts);
    const request: typeof result.request = async (req) => {
      if (req.method === "eth_sendRawTransaction" && req.params instanceof Array) {
        const txs = req.params.map((data: Hex) => keccak256(data));
        debug("saw txs", txs);
        // TODO: pass these tx hashes into dev tools
      }
      // TODO: add support for `eth_sendTransaction`
      return result.request(req);
    };
    return {
      ...result,
      request,
    };
  }) as TTransport;
}
