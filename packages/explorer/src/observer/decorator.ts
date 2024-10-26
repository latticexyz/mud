import { Account, Chain, Client, Hex, Transport, WalletActions, getAbiItem } from "viem";
import { BundlerActions, sendUserOperation, waitForUserOperationReceipt } from "viem/account-abstraction";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { formatAbiItem, getAction } from "viem/utils";
import { isDefined } from "@latticexyz/common/utils";
import { createBridge } from "./bridge";
import { ReceiptSummary } from "./common";
import { UserOperationCall } from "./messages";

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
        const writeId = `${client.uid}-${++writeCounter}`;
        const write = getAction(client, sendUserOperation, "sendUserOperation")(args);

        let calls: UserOperationCall[] = [];
        if ("calls" in args && args.calls) {
          calls = args.calls
            .map((call) => {
              if (
                call &&
                typeof call === "object" &&
                "abi" in call &&
                "functionName" in call &&
                "args" in call &&
                "to" in call
              ) {
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
                } as UserOperationCall;
              }

              return undefined;
            })
            .filter(isDefined);
        }

        emit("write", {
          writeId,
          from: client.account!.address,
          calls,
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
            // @ts-expect-error TODO: the result is actually { value: UserOperationReceipt }
            emit("waitForUserOperationReceipt:result", { ...result.value, writeId });
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
          from: client.account!.address,
          calls: [
            {
              to: args.address,
              functionSignature: formatAbiItem(functionAbiItem),
              functionName: args.functionName,
              args: (args.args ?? []) as never,
            },
          ],
          value: args.value, // TODO: how to handle value?
        });
        Promise.allSettled([write]).then(([result]) => {
          emit("write:result", { ...result, writeId });
        });

        write.then((hash) => {
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
