import { Transport, parseTransaction, serializeTransaction } from "viem";

export function mudTransportObserver<TTransport extends Transport>(transport: TTransport): TTransport {
  // console.log("wrapped transport", transport);
  return ((opts) => {
    const result = transport(opts);
    // console.log("got wrapped result", result, opts);
    const wrappedRequest: typeof result.request = async (req) => {
      if (opts.chain?.id === 31337) {
        console.log("got rpc req", req);
        if (req.method === "eth_estimateGas" && req.params instanceof Array) {
          req.params = req.params.map((params) => ({
            ...params,
            maxFeePerGas: "0x0",
            maxPriorityFeePerGas: "0x0",
          }));
        } else if (req.method === "eth_sendRawTransaction" && req.params instanceof Array) {
          req.params = req.params.map((hex) => {
            const { r, s, v, ...tx } = parseTransaction(hex);
            console.log("parsed tx", tx);
            tx.maxFeePerGas = 0n;
            tx.maxPriorityFeePerGas = 0n;
            tx.nonce = tx.nonce != null ? tx.nonce + 3 : undefined;
            // delete tx.nonce;
            // delete tx.maxFeePerGas;
            // delete tx.maxPriorityFeePerGas;
            return serializeTransaction(tx, r != null && s != null && v != null ? { r, s, v } : undefined);
          });
        }
      }
      return result.request(req);
    };
    return {
      ...result,
      request: wrappedRequest,
    };
  }) as TTransport;
}
