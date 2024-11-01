import {
  BundlerRpcSchema,
  EIP1193RequestFn,
  Hash,
  RpcUserOperationReceipt,
  Transport,
  createTransport,
  numberToHex,
} from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { TransportRequestFn } from "./common";
import { estimateUserOperationGas } from "./methods/estimateUserOperationGas";
import { sendUserOperation } from "./methods/sendUserOperation";
import { ConnectedClient } from "../common";

export function userOpExecutor({ executor }: { executor: ConnectedClient }): Transport {
  return () => {
    const receipts = new Map<Hash, RpcUserOperationReceipt<"0.7">>();

    const request: TransportRequestFn<BundlerRpcSchema> = async ({ method, params }) => {
      // TODO: move chain/ID into args and executors as accounts instead of clients?
      if (method === "eth_chainId") {
        return numberToHex(executor.chain.id);
      }

      if (method === "eth_supportedEntryPoints") {
        return [entryPoint07Address];
      }

      if (method === "eth_sendUserOperation") {
        const [rpcUserOp, entrypoint] = params;
        if (entrypoint === entryPoint07Address) {
          const result = await sendUserOperation({ executor, rpcUserOp });
          receipts.set(result.userOpHash, result as RpcUserOperationReceipt<"0.7">);
          return result.userOpHash;
        }
      }

      if (method === "eth_getUserOperationReceipt") {
        const [hash] = params;
        return receipts.get(hash) ?? null;
      }

      if (method === "eth_estimateUserOperationGas") {
        return await estimateUserOperationGas(params);
      }

      throw new Error("Not implemented");
    };

    return createTransport({
      key: "userOpExecutor",
      type: "userOpExecutor",
      name: "User Operation Executor Transport",
      request: request as EIP1193RequestFn,
    });
  };
}
