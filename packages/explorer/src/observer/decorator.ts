import { Account, Address, Chain, Client, Hex, Transport, WalletActions } from "viem";
import { BundlerActions, sendUserOperation, waitForUserOperationReceipt } from "viem/account-abstraction";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import { isDefined } from "@latticexyz/common/utils";
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
        const writeId = `${client.uid}-${++writeCounter}`;
        const write = getAction(client, sendUserOperation, "sendUserOperation")(args);
        if (!("calls" in args) || !args.calls) return write;

        const calls = args.calls
          .map((call) => {
            if (!call || typeof call !== "object") return undefined;
            if (!("to" in call) || typeof call.to !== "string") return undefined;
            if (!("functionName" in call) || typeof call.functionName !== "string") return undefined;
            if (!("args" in call) || !Array.isArray(call.args)) return undefined;

            return {
              to: call.to as Address,
              functionName: call.functionName,
              args: call.args,
              ...("value" in call && typeof call.value === "bigint" && { value: call.value }),
            };
          })
          .filter(isDefined);
        if (calls.length === 0) return write;

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
            emit("waitForUserOperationReceipt:result", { ...result, writeId });
          });
        });

        return write;
      },

      async writeContract(args) {
        const writeId = `${client.uid}-${++writeCounter}`;
        const write = getAction(client, writeContract, "writeContract")(args);

        emit("write", {
          writeId,
          from: client.account!.address,
          calls: [
            {
              to: args.address,
              functionName: args.functionName,
              args: (args.args ?? []) as never,
              ...(args.value && { value: args.value }),
            },
          ],
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
