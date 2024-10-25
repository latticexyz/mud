import { Account, Chain, Client, Hex, Transport, WalletActions, getAbiItem } from "viem";
import { sendUserOperation, waitForUserOperationReceipt } from "viem/account-abstraction";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { formatAbiItem, getAction } from "viem/utils";
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
  // TODO: type BundlerActions properly, not working ( & Pick<BundlerActions, "sendUserOperation">)
) => Pick<WalletActions<chain, account>, "writeContract"> {
  const emit = createBridge({ url: `${explorerUrl}/internal/observer-relay` });

  return (client) => {
    return {
      async sendUserOperation(args) {
        const writeId = `${client.uid}-${++writeCounter}`;
        const write = getAction(client, sendUserOperation, "sendUserOperation")(args);

        emit("write", {
          writeId,
          from: client.account!.address,
          calls: args.calls.map((call) => {
            const functionAbiItem = getAbiItem({
              abi: call.abi,
              name: call.functionName,
              args: call.args,
            } as never)!;

            return {
              to: call.to,
              functionSignature: formatAbiItem(functionAbiItem), // TODO: is it needed?
              functionName: call.functionName,
              args: call.args,
            };
          }),
        });
        Promise.allSettled([write]).then(([result]) => {
          emit("write:result", { ...result, writeId });
        });

        write.then((userOpHash) => {
          const receipt = getAction(
            client,
            waitForUserOperationReceipt,
            "waitForUserOperationReceipt",
          )({ hash: userOpHash });

          emit("waitForUserOperationReceipt", { writeId, userOpHash });
          Promise.allSettled([receipt]).then(([result]) => {
            emit("waitForUserOperationReceipt:result", {
              receipt: result.value.receipt,
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
          address: args.address,
          from: client.account!.address,
          functionSignature: formatAbiItem(functionAbiItem),
          args: (args.args ?? []) as never,
          value: args.value,
        });
        Promise.allSettled([write]).then(([result]) => {
          emit("write:result", { ...result, writeId });
        });

        write.then((hash) => {
          const receipt = getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({ hash });

          emit("waitForTransactionReceipt", { writeId, hash });
          Promise.allSettled([receipt]).then(([result]) => {
            emit("waitForTransactionReceipt:result", { writeId, receipt: result });
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
