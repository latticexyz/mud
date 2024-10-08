import { Account, Chain, Client, Hex, Transport, WalletActions, getAbiItem } from "viem";
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
) => Pick<WalletActions<chain, account>, "writeContract"> {
  const emit = createBridge({ url: `${explorerUrl}/internal/observer-relay` });

  return (client) => ({
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
  });
}
