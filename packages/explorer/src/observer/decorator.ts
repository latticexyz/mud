import { Account, Chain, Client, Hex, Transport, WalletActions, decodeFunctionData, getAbiItem, parseAbi } from "viem";
import {
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

// type ObservedTransaction = {
//   writeId: string;
//   hash?: Hex;
//   from?: Address;
//   timestamp?: bigint;
//   transaction?: Transaction;
//   functionData?: DecodeFunctionDataReturnType;
//   value?: bigint;
//   receipt?: TransactionReceipt;
//   status: "pending" | "success" | "reverted" | "rejected" | "unknown";
//   write?: Write;
//   logs?: Log[];
//   error?: BaseError;
// }

export function observer({ explorerUrl = "http://localhost:13690", waitForTransaction }: ObserverOptions = {}): <
  transport extends Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>(
  client: Client<transport, chain, account>,
) => Pick<WalletActions<chain, account>, "writeContract"> {
  const emit = createBridge({ url: `${explorerUrl}/internal/observer-relay` });

  return (client) => {
    if (client.type === "bundlerClient") {
      return {
        async sendUserOperation(args) {
          console.log("observerWrite sendUserOperation args:", args);

          const writeId = `${client.uid}-${++writeCounter}`; // TODO: rename write to send ?
          const write = getAction(client, sendUserOperation, "sendUserOperation")(args);
          const calls = args.calls;

          emit("send", {
            writeId,
            calls: calls.map((call) => {
              const functionAbiItem = getAbiItem({
                abi: call.abi,
                name: call.functionName,
                args: call.args,
              } as never)!;

              return {
                to: call.to,
                functionSignature: formatAbiItem(functionAbiItem),
                args: call.args,
              };
            }),
          });

          write.then((hash) => {
            const receipt = getAction(client, waitForUserOperationReceipt, "waitForUserOperationReceipt")({ hash });

            emit("waitForUserOperationReceipt", { writeId, hash });
            Promise.allSettled([receipt]).then(async ([result]) => {
              emit("waitForUserOperationReceipt:result", { ...result.value, writeId });

              // const logs = result.value?.logs;
              // const parsedLogs = parseEventLogs({
              //   abi: [...doomWorldAbi, userOperationEventAbi],
              //   logs,
              // });

              // const receiptLogs = result.value?.receipt?.logs;
              // const parsedReceiptLogs = parseEventLogs({
              //   abi: [...doomWorldAbi, userOperationEventAbi],
              //   logs: receiptLogs,
              // });

              // console.log("observerWrite parsedLogs:", parsedLogs);
              // console.log("observerWrite parsedReceiptLogs:", parsedReceiptLogs);
            });
          });

          // emit("write", {
          //   writeId,

          //   address: args.address,
          //   from: client.account!.address,
          //   functionSignature: "batch call", // formatAbiItem(functionAbiItem),
          //   args: (args.args ?? []) as never,
          //   value: args.value,
          // });

          // // for (const call of calls) {
          // const call = calls[0];
          //
          // const { to, args: functionArgs, abi, functionName } = call;

          // console.log("observerWrite call", call);

          // const functionAbiItem = getAbiItem({
          //   abi,
          //   name: functionName,
          //   args,
          // } as never)!;

          // emit("write", {
          //   writeId,
          //   address: to,
          //   from: client.account!.address,
          //   functionSignature: formatAbiItem(functionAbiItem),
          //   args: (functionArgs.args ?? []) as never,
          //   value: functionArgs.value,
          // });

          return write;
        },
      };
    }

    return {
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
