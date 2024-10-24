import { Account, Chain, Client, Hex, Transport, WalletActions, decodeFunctionData, getAbiItem, parseAbi } from "viem";
import {
  BundlerActions,
  entryPoint07Abi,
  entryPoint07Address,
  sendUserOperation,
  waitForUserOperationReceipt,
} from "viem/account-abstraction";
import { getTransaction, waitForTransactionReceipt, writeContract } from "viem/actions";
import { formatAbiItem, getAction } from "viem/utils";
import {
  doomWorldAbi,
  userOperationEventAbi,
} from "../app/(explorer)/[chainName]/worlds/[worldAddress]/observe/TransactionsWatcher";
import { createBridge } from "./bridge";
import { ReceiptSummary } from "./common";

export type WaitForTransaction = (hash: Hex) => Promise<ReceiptSummary>;

export type ObserverOptions = {
  explorerUrl?: string;
  waitForTransaction?: WaitForTransaction;
};

let writeCounter = 0;

export function observer({ explorerUrl = "http://localhost:13690", waitForTransaction }: ObserverOptions = {}): <
  transport extends Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>(
  client: Client<transport, chain, account>,
) => Pick<WalletActions<chain, account>, "writeContract"> & Pick<BundlerActions, "sendUserOperation"> {
  const emit = createBridge({ url: `${explorerUrl}/internal/observer-relay` });

  return (client) => {
    return {
      async sendUserOperation(args) {
        console.log("observerWrite sendUserOperation args:", args);

        const writeId = `${client.uid}-${++writeCounter}`; // TODO: rename write to send ?
        const write = getAction(client, sendUserOperation, "sendUserOperation")(args);
        const calls = args.calls;

        emit("write", {
          writeId,
          clientType: client.type,
          from: client.account!.address,
          calls: calls.map((call) => {
            const functionAbiItem = getAbiItem({
              abi: call.abi,
              name: call.functionName,
              args: call.args,
            } as never)!;

            return {
              to: call.to, // TODO: rename to `to`
              functionSignature: formatAbiItem(functionAbiItem),
              functionName: call.functionName,
              args: call.args,
            };
          }),
        });
        Promise.allSettled([write]).then(([result]) => {
          emit("write:result", { ...result, writeId });
        });

        write.then((hash) => {
          const receipt = getAction(client, waitForUserOperationReceipt, "waitForUserOperationReceipt")({ hash });

          emit("waitForUserOperationReceipt", { writeId, hash });
          Promise.allSettled([receipt]).then(async ([result]) => {
            emit("waitForUserOperationReceipt:result", {
              ...result.value,
              hash: result.value.receipt.transactionHash,
              writeId,
            });
          });
        });

        return write;
      },

      async writeContract(args) {
        const writeId = `${client.uid}-${++writeCounter}`;
        const write = getAction(client, writeContract, "writeContract")(args);

        // `writeContract` above will throw if this isn't present
        const functionAbiItem = getAbiItem({
          abi: args.abi,
          name: args.functionName,
          args: args.args,
        } as never)!;

        emit("write", {
          writeId,
          clientType: client.type,
          address: args.address,
          from: client.account!.address,
          functionSignature: formatAbiItem(functionAbiItem),
          args: (args.args ?? []) as never,
          value: args.value,
        });
        Promise.allSettled([write]).then(([result]) => {
          emit("write:result", { ...result, writeId });
        });

        write.then(async (hash) => {
          const receipt = getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({ hash });

          emit("waitForTransactionReceipt", { writeId, hash });
          Promise.allSettled([receipt]).then(([result]) => {
            emit("waitForTransactionReceipt:result", { ...result, writeId });
          });
        });

        if (waitForTransaction) {
          write.then((hash) => {
            const receipt = waitForTransaction(hash);

            emit("waitForTransaction", { writeId });
            Promise.allSettled([receipt]).then(([result]) => {
              emit("waitForTransaction:result", { ...result, writeId });
            });
          });
        }

        return write;
      },
    };
  };
}
