import {
  BundlerRpcSchema,
  EIP1193RequestFn,
  Hash,
  RpcUserOperationReceipt,
  Transport,
  createTransport,
  getAbiItem,
  numberToHex,
  parseEther,
} from "viem";
import {
  entryPoint06Abi,
  entryPoint06Address,
  entryPoint07Address,
  entryPoint08Address,
} from "viem/account-abstraction";
import { TransportRequestFn } from "./common";
import { estimateUserOperationGas } from "./methods/estimateUserOperationGas";
import { sendUserOperation } from "./methods/sendUserOperation";
import { ConnectedClient } from "../../common";
import { debug } from "../debug";
import { getLogs, getTransactionReceipt, setBalance } from "viem/actions";
import { getUserOperationReceipt } from "@latticexyz/common/internal";

// TODO: move to common package?

export function userOpExecutor({
  executor,
  fallbackDefaultTransport,
}: {
  executor: ConnectedClient;
  fallbackDefaultTransport: Transport;
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
        const [userOpHash] = params;
        if (receipts.has(userOpHash)) return receipts.get(userOpHash)!;

        const event = getAbiItem({
          abi: entryPoint06Abi,
          name: "UserOperationEvent",
        });

        const log = (
          await getLogs(executor, {
            address: [entryPoint06Address, entryPoint07Address, entryPoint08Address],
            event,
            args: { userOpHash },
          })
        ).at(0);

        if (!log) return null;
        const hash = log.transactionHash;
        const receipt = await getTransactionReceipt(executor, { hash });

        const userOpReceipt = getUserOperationReceipt(userOpHash, {
          ...receipt,
          blobGasPrice: receipt.blobGasPrice ? numberToHex(receipt.blobGasPrice) : undefined,
          blobGasUsed: receipt.blobGasUsed ? numberToHex(receipt.blobGasUsed) : undefined,
          blockNumber: numberToHex(receipt.blockNumber),
          cumulativeGasUsed: numberToHex(receipt.cumulativeGasUsed),
          effectiveGasPrice: numberToHex(receipt.effectiveGasPrice),
          gasUsed: numberToHex(receipt.gasUsed),
          logs: receipt.logs.map((log) => ({
            ...log,
            blockNumber: numberToHex(log.blockNumber),
            logIndex: numberToHex(log.logIndex),
            transactionIndex: numberToHex(log.transactionIndex),
          })),
          status: receipt.status as never,
          transactionIndex: numberToHex(receipt.transactionIndex),
        });

        return userOpReceipt;
      }

      if (method === "eth_estimateUserOperationGas") {
        return await estimateUserOperationGas(params);
      }

      debug(`userOpExecutor: method "${method}" not overridden, falling back to fallback transport`);
      const { request: fallbackRequest } = fallbackDefaultTransport(opts);

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
