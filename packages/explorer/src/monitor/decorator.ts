import { Account, Chain, Client, Hex, Transport, WalletActions, getAbiItem } from "viem";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { formatAbiItem, getAction } from "viem/utils";
import { createBridge } from "./bridge";
import { ReceiptSummary } from "./common";

export type WaitForStateChange = (hash: Hex) => Promise<ReceiptSummary>;

export type MonitorOptions = {
  explorerUrl?: string;
  waitForStateChange?: WaitForStateChange;
};

export function monitor<transport extends Transport, chain extends Chain, account extends Account>({
  explorerUrl = "http://127.0.0.1:13690",
  waitForStateChange,
}: MonitorOptions): (
  client: Client<transport, chain, account>,
) => Pick<WalletActions<chain, account>, "writeContract"> {
  const emit = createBridge({ url: `${explorerUrl}/internal/monitor-relay` });

  setInterval(() => {
    emit("ping", null);
  }, 2000);

  return (client) => {
    let counter = 0;
    return {
      async writeContract(args) {
        const writeId = `${client.uid}-${++counter}`;
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
          functionSignature: formatAbiItem(functionAbiItem),
          args: (args.args ?? []) as never,
        });
        Promise.allSettled([write]).then(([result]) => {
          emit("write:result", { ...result, writeId });
        });

        write.then((hash) => {
          const receipt = getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({ hash });
          emit("waitForTransactionReceipt", { writeId });
          Promise.allSettled([receipt]).then(([result]) => {
            emit("waitForTransactionReceipt:result", { ...result, writeId });
          });
        });

        if (waitForStateChange) {
          write.then((hash) => {
            const receipt = waitForStateChange(hash);
            emit("waitForStateChange", { writeId });
            Promise.allSettled([receipt]).then(([result]) => {
              emit("waitForStateChange:result", { ...result, writeId });
            });
          });
        }

        return write;
      },
    };
  };
}
