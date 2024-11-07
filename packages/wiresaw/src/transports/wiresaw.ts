import { BundlerRpcSchema, Hash, Hex, PublicRpcSchema, RpcTransactionReceipt, Transport, http } from "viem";
import { getRpcMethod, getRpcSchema, TransportRequestFn, TransportRequestFnMapped } from "./common";
import { getUserOperationReceipt } from "./methods/getUserOperationReceipt";

export type WiresawRpcSchema = [
  {
    Method: "wiresaw_call";
    Parameters: getRpcMethod<PublicRpcSchema, "eth_call">["Parameters"];
    ReturnType: getRpcMethod<PublicRpcSchema, "eth_call">["ReturnType"];
  },
  {
    Method: "wiresaw_getTransactionReceipt";
    Parameters: getRpcMethod<PublicRpcSchema, "eth_getTransactionReceipt">["Parameters"];
    ReturnType: getRpcMethod<PublicRpcSchema, "eth_getTransactionReceipt">["ReturnType"];
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

type ChainCache = {
  receipts: Map<Hash, RpcTransactionReceipt>;
  /**
   * user op hash to transaction hash
   */
  userOps: Map<Hash, Hash>;
};

const cache = new Map<Hex, ChainCache>();

function getCache(chainId: Hex) {
  const cached = cache.get(chainId) ?? {
    receipts: new Map<Hash, RpcTransactionReceipt>(),
    userOps: new Map<Hash, Hash>(),
  };
  if (!cache.has(chainId)) cache.set(chainId, cached);
  return cached;
}

export function wiresaw<const transport extends Transport>(getTransport: transport): transport {
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

    async function getReceipt(hash: Hex, receipts: ChainCache["receipts"]) {
      if (receipts.has(hash)) return receipts.get(hash)!;
      const [wiresawReceipt, chainReceipt] = await Promise.all([
        wiresawTransport.request({ method: "wiresaw_getTransactionReceipt", params: [hash] }),
        transport.request({ method: "eth_getTransactionReceipt", params: [hash] }),
      ]);
      const receipt = wiresawReceipt ?? chainReceipt;
      if (receipt != null) receipts.set(hash, receipt);
      return receipt;
    }

    const request: TransportRequestFnMapped<OverriddenMethods> = async ({ method, params }, opts) => {
      if (method === "eth_chainId") {
        return await getChainId();
      }

      // TODO: only route to wiresaw if using pending block tag
      if (method === "eth_call") {
        return wiresawTransport.request({ method: "wiresaw_call", params });
      }

      // We intentionally don't reroute `eth_sendRawTransaction` because Wiresaw
      // already handles this method within the RPC spec, where it returns the
      // tx receipt, which can be fetched immediately with `eth_getTransactionReceipt`.

      if (method === "eth_getTransactionReceipt") {
        const { receipts } = getCache(await getChainId());
        const [hash] = params;
        return await getReceipt(hash, receipts);
      }

      if (method === "eth_sendUserOperation") {
        const { userOps } = getCache(await getChainId());
        const result = await wiresawTransport.request({
          method: "wiresaw_sendUserOperation",
          params,
        });
        userOps.set(result.userOpHash, result.txHash);
        return result.userOpHash;
      }

      if (method === "eth_getUserOperationReceipt") {
        const { receipts, userOps } = getCache(await getChainId());
        const [userOpHash] = params;
        const transactionHash = userOps.get(userOpHash);

        if (!transactionHash) {
          // TODO: look up user op logs
          // https://github.com/latticexyz/alto/blob/206dd8fc0d672a3d49e06d4bdd2eff4d519bdea3/src/executor/executorManager.ts#L617-L625
          throw new Error(`Could not find transaction hash for user op hash "${userOpHash}".`);
        }

        const receipt = await getReceipt(transactionHash, receipts);
        if (!receipt) return null;

        return getUserOperationReceipt(userOpHash, receipt);
      }

      return await transport.request({ method, params }, opts);
    };

    return { ...transport, request };
  }) as transport;
}
