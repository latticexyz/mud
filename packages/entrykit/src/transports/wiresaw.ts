import { Hash, Hex, RpcTransactionReceipt, RpcUserOperationReceipt, Transport } from "viem";

export const wiresawChainIds = new Set([17420, 31337]);

export function wiresaw<const transport extends Transport>(originalTransport: transport): transport {
  return ((opts) => {
    const { request: originalRequest, ...rest } = originalTransport(opts);

    let chainId: Hex | null = null;
    const receipts = new Map<Hash, RpcTransactionReceipt | RpcUserOperationReceipt>();

    return {
      ...rest,
      async request(req) {
        // console.log("wiresaw: got rpc call", req.method, JSON.stringify(req.params ?? []));

        if (req.method === "eth_chainId") {
          if (chainId != null) return chainId;
          return (chainId = await originalRequest(req));
        }

        // if (req.method === "eth_estimateGas") {
        //   return originalRequest({ ...req, method: "wiresaw_estimateGas" });
        // }

        // if (req.method === "eth_sendRawTransaction") {
        //   const receipt = (await originalRequest({
        //     ...req,
        //     method: "wiresaw_sendRawTransaction",
        //     // TODO: type `request` so we don't have to cast
        //   })) as RpcTransactionReceipt;
        //   // TODO: wiresaw should return an appropriate error here
        //   if (receipt == null) {
        //     throw new Error("Failed to include transaction.");
        //   }
        //   receipts.set(receipt["transactionHash"], receipt);
        //   return receipt["transactionHash"];
        // }

        // TODO: only route to wiresaw if using pending block tag
        if (req.method === "eth_call") {
          return originalRequest({ ...req, method: "wiresaw_call" });
        }

        if (req.method === "eth_getTransactionReceipt") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const hash = (req.params as any)[0] as Hash;
          const receipt = receipts.get(hash) ?? ((await originalRequest(req)) as RpcTransactionReceipt);
          if (!receipts.has(hash)) receipts.set(hash, receipt);
          return receipt;
        }

        if (req.method === "eth_sendUserOperation") {
          // TODO: type `request` so we don't have to cast
          const result = (await originalRequest({
            ...req,
            method: "wiresaw_sendUserOperation",
          })) as { txHash: Hex; userOpHash: Hex };
          // :haroldsmile:
          receipts.set(result.userOpHash, {
            success: true,
            userOpHash: result.userOpHash,
            receipt: { transactionHash: result.txHash },
          } as RpcUserOperationReceipt);
          return result.userOpHash;
        }

        if (req.method === "eth_getUserOperationReceipt") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const hash = (req.params as any)[0] as Hash;
          const receipt = receipts.get(hash) ?? ((await originalRequest(req)) as RpcUserOperationReceipt);
          if (!receipts.has(hash)) receipts.set(hash, receipt);
          return receipt;
        }

        return originalRequest(req);
      },
    };
  }) as transport;
}
