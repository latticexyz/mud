import {
  BundlerRpcSchema,
  Hash,
  Hex,
  PublicRpcSchema,
  RpcTransactionReceipt,
  RpcUserOperationReceipt,
  Transport,
  http,
} from "viem";
import { getRpcMethod, getRpcSchema, TransportRequestFn, TransportRequestFnMapped } from "./common";

// TODO: dedupe this with quarry package

export type WiresawRpcSchema = [
  {
    Method: "wiresaw_call";
    Parameters: getRpcMethod<PublicRpcSchema, "eth_call">["Parameters"];
    ReturnType: getRpcMethod<PublicRpcSchema, "eth_call">["ReturnType"];
  },
  {
    Method: "wiresaw_sendUserOperation";
    Parameters: getRpcMethod<BundlerRpcSchema, "eth_sendUserOperation">["Parameters"];
    ReturnType: {
      userOpHash: Hex;
      txHash: Hex;
    };
  },
];

export type OverriddenMethods = [
  ...getRpcSchema<PublicRpcSchema, "eth_chainId" | "eth_call" | "eth_getTransactionReceipt">,
  ...getRpcSchema<BundlerRpcSchema, "eth_sendUserOperation" | "eth_getUserOperationReceipt">,
];

export function wiresaw<const transport extends Transport>(getTransport: transport): transport {
  const cache = new Map<
    Hex,
    {
      receipts: Map<Hash, RpcTransactionReceipt>;
      userOpReceipts: Map<Hash, RpcUserOperationReceipt>;
    }
  >();

  function getReceiptsCache(chainId: Hex) {
    const cached = cache.get(chainId) ?? {
      receipts: new Map<Hash, RpcTransactionReceipt>(),
      userOpReceipts: new Map<Hash, RpcUserOperationReceipt>(),
    };
    if (!cache.has(chainId)) cache.set(chainId, cached);
    return cached;
  }

  return ((args) => {
    const getWiresawTransport =
      args.chain?.rpcUrls && "wiresaw" in args.chain.rpcUrls ? http(args.chain.rpcUrls.wiresaw.http[0]) : undefined;
    if (!getWiresawTransport) return getTransport(args);

    const transport = getTransport(args) as { request: TransportRequestFn<OverriddenMethods> };
    const wiresawTransport = getWiresawTransport(args) as { request: TransportRequestFn<WiresawRpcSchema> };

    let chainId: Hex | null = null;
    async function getChainId() {
      return (chainId ??= await transport.request({ method: "eth_chainId" }));
    }

    const request: TransportRequestFnMapped<OverriddenMethods> = async ({ method, params }, opts) => {
      const { receipts, userOpReceipts } = getReceiptsCache(await getChainId());

      if (method === "eth_chainId") {
        return await getChainId();
      }

      // TODO: only route to wiresaw if using pending block tag
      if (method === "eth_call") {
        return wiresawTransport.request({ method: "wiresaw_call", params });
      }

      if (method === "eth_getTransactionReceipt") {
        const [hash] = params;
        const receipt = receipts.get(hash) ?? (await transport.request({ method, params }));
        if (!receipts.has(hash) && receipt) receipts.set(hash, receipt);
        return receipt;
      }

      if (method === "eth_sendUserOperation") {
        const result = await wiresawTransport.request({
          method: "wiresaw_sendUserOperation",
          params,
        });

        // :haroldsmile:
        userOpReceipts.set(result.userOpHash, {
          success: true,
          userOpHash: result.userOpHash,
          receipt: { transactionHash: result.txHash },
        } as RpcUserOperationReceipt);

        return result.userOpHash;
      }

      if (method === "eth_getUserOperationReceipt") {
        const [hash] = params;

        const receipt = userOpReceipts.get(hash) ?? (await transport.request({ method, params }));
        if (!userOpReceipts.has(hash) && receipt) userOpReceipts.set(hash, receipt);
        return receipt;
      }

      return await transport.request({ method, params }, opts);
    };

    return { ...transport, request };
  }) as transport;
}
