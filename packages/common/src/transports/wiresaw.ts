import { EIP1193RequestFn, Hex, RpcTransactionReceipt, Transport } from "viem";
import { estimateUserOperationGas } from "./methods/estimateUserOperationGas";
import { getUserOperationReceipt } from "./methods/getUserOperationReceipt";

type WiresawSendUserOperationResult = {
  txHash: Hex;
  userOpHash: Hex;
};

type WiresawOptions<transport extends Transport> = {
  wiresaw: transport;
  fallbackBundler?: Transport;
  fallbackEth?: Transport;
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
        try {
          if (req.method === "eth_chainId") {
            if (chainId != null) return chainId;
            if (transport.fallbackEth) {
              const { request: fallbackRequest } = transport.fallbackEth(opts);
              return (chainId = await fallbackRequest(req));
            }
            return (chainId = await originalRequest(req));
          }

          if (req.method === "eth_estimateGas") {
            return await originalRequest({ ...req, method: "wiresaw_estimateGas" });
          }

          if (req.method === "eth_call") {
            return await originalRequest({ ...req, method: "wiresaw_call" });
          }

          if (req.method === "eth_getTransactionCount") {
            return await originalRequest({ ...req, method: "wiresaw_getTransactionCount" });
          }

          if (req.method === "eth_getTransactionReceipt") {
            return await getTransactionReceipt((req.params as [Hex])[0]);
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
              const transactionReceipt = await getTransactionReceipt(knownTransactionHash);
              if (transactionReceipt) {
                return getUserOperationReceipt(userOpHash, transactionReceipt);
              }
            }
            if (transport.fallbackBundler) {
              const { request: fallbackRequest } = transport.fallbackBundler(opts);
              return await fallbackRequest(req);
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
              return await fallbackRequest(req);
            }
          }

          // Fallback to regular RPC for methods that don't require wiresaw
          if (
            req.method === "eth_blockNumber" ||
            req.method === "eth_getBlockByNumber" ||
            req.method === "eth_maxPriorityFeePerGas"
          ) {
            if (transport.fallbackEth) {
              const { request: fallbackRequest } = transport.fallbackEth(opts);
              return await fallbackRequest(req);
            }
            return await originalRequest(req);
          }

          return await originalRequest(req);
        } catch (e) {
          console.warn("[wiresaw] request error", e);
          const bundlerMethods = [
            "eth_estimateUserOperationGas",
            "eth_sendUserOperation",
            "eth_getUserOperationReceipt",
          ];
          if (bundlerMethods.includes(req.method)) {
            if (transport.fallbackBundler) {
              const { request: fallbackRequest } = transport.fallbackBundler(opts);
              console.warn("[wiresaw] falling back to bundler rpc", req);
              return fallbackRequest(req);
            }
          }
          if (transport.fallbackEth) {
            const { request: fallbackRequest } = transport.fallbackEth(opts);
            console.warn("[wiresaw] falling back to eth rpc", req);
            return fallbackRequest(req);
          }
          throw e;
        }

        async function getTransactionReceipt(hash: Hex): Promise<RpcTransactionReceipt | undefined> {
          // Return cached receipt if available
          if (transactionReceipts[hash]) return transactionReceipts[hash];

          // Fetch pending receipt
          const pendingReceipt = (await originalRequest({
            ...req,
            method: "wiresaw_getTransactionReceipt",
            params: [hash],
          })) as RpcTransactionReceipt | undefined;
          if (pendingReceipt) {
            transactionReceipts[hash] = pendingReceipt;
            return pendingReceipt;
          }

          if (transport.fallbackEth) {
            const { request: fallbackRequest } = transport.fallbackEth(opts);
            const receipt = (await fallbackRequest({
              ...req,
              method: "eth_getTransactionReceipt",
              params: [hash],
            })) as RpcTransactionReceipt | undefined;
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
