import {
  BundlerRpcSchema,
  EIP1193RequestFn,
  Hash,
  RpcUserOperationReceipt,
  Transport,
  createTransport,
  numberToHex,
  parseEther,
} from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { TransportRequestFn } from "./common";
import { estimateUserOperationGas } from "./methods/estimateUserOperationGas";
import { sendUserOperation } from "./methods/sendUserOperation";
import { ConnectedClient } from "../../common";
import { debug } from "../debug";
import { setBalance } from "viem/actions";

// TODO: move to common package?

export function userOpExecutor({
  executor,
  fallbackEth,
}: {
  executor: ConnectedClient;
  fallbackEth: Transport;
}): Transport {
  return (opts) => {
    debug("using a local user op executor", executor.account.address);

    if (executor.chain.id === 31337) {
      debug("setting executor balance");
      setBalance(
        executor.extend(() => ({ mode: "anvil" })),
        {
          address: executor.account.address,
          value: parseEther("100"),
        },
      );
    }

    const receipts = new Map<Hash, RpcUserOperationReceipt<"0.7">>();

    // @ts-expect-error TODO
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

      debug(`userOpExecutor: method "${method}" not overridden, falling back to fallback transport`);
      const { request: fallbackRequest } = fallbackEth(opts);

      return fallbackRequest({ method, params });
    };

    return createTransport({
      key: "userOpExecutor",
      type: "userOpExecutor",
      name: "User Operation Executor Transport",
      request: request as EIP1193RequestFn,
    });
  };
}
