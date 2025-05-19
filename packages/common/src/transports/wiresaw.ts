import { EIP1193RequestFn, Hex, HttpTransport, RpcTransactionReceipt, Transport } from "viem";
import { estimateUserOperationGas } from "./methods/estimateUserOperationGas";

type WiresawSendUserOperationResult = {
  txHash: Hex;
  userOpHash: Hex;
};

type WiresawOptions<transport extends Transport> = {
  wiresaw: transport;
  fallbackBundler?: HttpTransport;
  fallbackEth?: HttpTransport;
};

export function wiresaw<const wiresawTransport extends Transport>(
  transport: WiresawOptions<wiresawTransport>,
): wiresawTransport {
  return ((opts) => {
    const { request: originalRequest, ...rest } = transport.wiresaw(opts);

    let chainId: Hex | null = null;
    const transactionHashes: { [userOpHash: Hex]: Hex } = {};
    const transactionReceipts: { [transactionHashes: Hex]: RpcTransactionReceipt } = {};

    return {
      ...rest,
      // TODO: type `request` so we don't have to cast
      async request(req): ReturnType<EIP1193RequestFn> {
        if (req.method === "eth_chainId") {
          if (chainId != null) return chainId;
          return (chainId = await originalRequest(req));
        }

        if (req.method === "eth_estimateGas") {
          return originalRequest({ ...req, method: "wiresaw_estimateGas" });
        }

        if (req.method === "eth_call") {
          return originalRequest({ ...req, method: "wiresaw_call" });
        }

        if (req.method === "eth_getTransactionCount") {
          return originalRequest({ ...req, method: "wiresaw_getTransactionCount" });
        }

        if (req.method === "eth_getTransactionReceipt") {
          return getTransactionReceipt((req.params as [Hex])[0]);
        }

        if (req.method === "eth_sendUserOperation") {
          const { userOpHash, txHash } = (await originalRequest({
            ...req,
            method: "wiresaw_sendUserOperation",
          })) as WiresawSendUserOperationResult;
          transactionHashes[userOpHash] = txHash;
          return userOpHash;
        }

        if (req.method === "eth_getUserOperationReceipt") {
          const userOpHash = (req.params as [Hex])[0];
          const knownTransactionHash = transactionHashes[userOpHash];
          if (knownTransactionHash) {
            return getTransactionReceipt(knownTransactionHash);
          }
          if (transport.fallbackBundler) {
            const { request: fallbackRequest } = transport.fallbackBundler(opts);
            return fallbackRequest(req);
          }
        }

        if (req.method === "eth_estimateUserOperationGas") {
          try {
            return await estimateUserOperationGas({
              request: originalRequest,
              params: req.params as never,
            });
          } catch (e) {
            console.warn("[wiresaw] estimating user operation gas failed, falling back to bundler", e);
          }

          if (transport.fallbackBundler) {
            const { request: fallbackRequest } = transport.fallbackBundler(opts);
            return fallbackRequest(req);
          }
        }

        return originalRequest(req);

        async function getTransactionReceipt(hash: Hex): Promise<RpcTransactionReceipt | undefined> {
          // Return cached receipt if available
          if (transactionReceipts[hash]) return transactionReceipts[hash];

          // Fetch pending receipt
          const pendingReceipt = (await originalRequest({
            ...req,
            method: "wiresaw_getTransactionReceipt",
          })) as RpcTransactionReceipt | undefined;
          if (pendingReceipt) {
            transactionReceipts[hash] = pendingReceipt;
            return pendingReceipt;
          }

          if (transport.fallbackEth) {
            const { request: fallbackRequest } = transport.fallbackEth(opts);
            const receipt = (await fallbackRequest(req)) as RpcTransactionReceipt | undefined;
            if (receipt) {
              transactionReceipts[hash] = receipt;
              return receipt;
            }
          }
        }
      },
    };
  }) as wiresawTransport;
}
