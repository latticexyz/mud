import { Chain, EIP1193RequestFn, fallback, Hex, http, RpcTransactionReceipt, Transport, webSocket } from "viem";
import { estimateUserOperationGas } from "./methods/estimateUserOperationGas";
import { getUserOperationReceipt } from "./methods/getUserOperationReceipt";

type WiresawSendUserOperationResult = {
  txHash: Hex;
  userOpHash: Hex;
};

type WiresawOptions<transport extends Transport> = {
  /** wiresaw-compatible transport */
  wiresawTransport: transport;
  /** fallback transport for bundler RPC methods */
  fallbackBundlerTransport?: Transport;
  /** fallback transport for all other RPC methods */
  fallbackDefaultTransport?: Transport;
};

export function wiresaw<const wiresawTransport extends Transport>(
  transports?: WiresawOptions<wiresawTransport>,
): wiresawTransport {
  return ((opts) => {
    const { wiresawTransport, fallbackBundlerTransport, fallbackDefaultTransport } =
      transports ?? getDefaultTransports(opts.chain);

    const { request: wiresawRequest, ...rest } = wiresawTransport(opts);

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
            if (fallbackDefaultTransport) {
              const { request: fallbackRequest } = fallbackDefaultTransport(opts);
              return (chainId = await fallbackRequest(req));
            }
            return (chainId = await wiresawRequest(req));
          }

          if (req.method === "eth_estimateGas") {
            return await wiresawRequest({ ...req, method: "wiresaw_estimateGas" });
          }

          if (req.method === "eth_call") {
            return await wiresawRequest({ ...req, method: "wiresaw_call" });
          }

          if (req.method === "eth_getTransactionCount") {
            return await wiresawRequest({ ...req, method: "wiresaw_getTransactionCount" });
          }

          if (req.method === "eth_getTransactionReceipt") {
            return await getTransactionReceipt((req.params as [Hex])[0]);
          }

          if (req.method === "eth_sendUserOperation") {
            const { userOpHash, txHash } = (await wiresawRequest({
              ...req,
              method: "wiresaw_sendUserOperation",
            })) as WiresawSendUserOperationResult;
            transactionHashes[userOpHash] = txHash;
            return userOpHash;
          }

          if (req.method === "eth_getUserOperationReceipt") {
            const userOpHash = (req.params as [Hex])[0];
            const knownTransactionHash = transactionHashes[userOpHash];
            if (!knownTransactionHash) {
              throw new Error(`eth_getUserOperationReceipt only supported for own user operations`);
            }
            const transactionReceipt = await getTransactionReceipt(knownTransactionHash);
            return transactionReceipt && getUserOperationReceipt(userOpHash, transactionReceipt);
          }

          if (req.method === "eth_estimateUserOperationGas") {
            return await estimateUserOperationGas({
              request: wiresawRequest,
              params: req.params as never,
            });
          }

          // Fallback to regular RPC for methods that don't require wiresaw
          if (
            req.method === "eth_blockNumber" ||
            req.method === "eth_getBlockByNumber" ||
            req.method === "eth_maxPriorityFeePerGas"
          ) {
            if (fallbackDefaultTransport) {
              const { request: fallbackRequest } = fallbackDefaultTransport(opts);
              return await fallbackRequest(req);
            }
            return await wiresawRequest(req);
          }

          return await wiresawRequest(req);
        } catch (e) {
          console.warn("[wiresaw] request failed", e);
          const bundlerMethods = [
            "eth_estimateUserOperationGas",
            "eth_sendUserOperation",
            "eth_getUserOperationReceipt",
          ];
          if (bundlerMethods.includes(req.method)) {
            if (fallbackBundlerTransport) {
              const { request: fallbackRequest } = fallbackBundlerTransport(opts);
              console.warn("[wiresaw] falling back to bundler rpc", req);
              return fallbackRequest(req);
            }
          }
          if (fallbackDefaultTransport) {
            const { request: fallbackRequest } = fallbackDefaultTransport(opts);
            console.warn("[wiresaw] falling back to eth rpc", req);
            return fallbackRequest(req);
          }
          throw e;
        }

        async function getTransactionReceipt(hash: Hex): Promise<RpcTransactionReceipt | undefined> {
          // Return cached receipt if available
          if (transactionReceipts[hash]) return transactionReceipts[hash];

          // Fetch pending receipt
          const pendingReceipt = (await wiresawRequest({
            ...req,
            method: "wiresaw_getTransactionReceipt",
            params: [hash],
          })) as RpcTransactionReceipt | undefined;
          if (pendingReceipt) {
            transactionReceipts[hash] = pendingReceipt;
            return pendingReceipt;
          }

          if (fallbackDefaultTransport) {
            const { request: fallbackRequest } = fallbackDefaultTransport(opts);
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

function getWiresawBaseTransport(chain: Chain): Transport | undefined {
  const wiresawWebSocketUrl = chain.rpcUrls.wiresaw?.webSocket?.[0];
  const wiresawHttpUrl = chain.rpcUrls.wiresaw?.http[0];

  if (wiresawWebSocketUrl) {
    return wiresawHttpUrl
      ? fallback([webSocket(wiresawWebSocketUrl), http(wiresawHttpUrl)])
      : webSocket(wiresawWebSocketUrl);
  }

  if (wiresawHttpUrl) {
    return http(wiresawHttpUrl);
  }
}

function getDefaultTransports(chain?: Chain): WiresawOptions<Transport> {
  if (!chain) {
    throw new Error("No chain or transports provided");
  }

  const wiresawTransport = getWiresawBaseTransport(chain);
  if (!wiresawTransport) {
    throw new Error("Provided chain does not support wiresaw");
  }

  const bundlerHttpUrl = chain.rpcUrls.bundler?.http[0];
  return {
    wiresawTransport,
    fallbackBundlerTransport: bundlerHttpUrl ? http(bundlerHttpUrl) : undefined,
    fallbackDefaultTransport: http(),
  };
}
