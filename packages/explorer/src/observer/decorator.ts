import { Account, Chain, Client, Hex, Transport, WalletActions, decodeFunctionData, getAbiItem, parseAbi } from "viem";
import {
  entryPoint07Address,
  getUserOperation,
  getUserOperationHash,
  sendUserOperation,
  waitForUserOperationReceipt,
} from "viem/account-abstraction";
import { getTransaction, waitForTransactionReceipt, writeContract } from "viem/actions";
import { formatAbiItem, getAction } from "viem/utils";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { createBridge } from "./bridge";
import { ReceiptSummary } from "./common";
import { getUserOperationHashV07 } from "./utils";

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

  return (client) => {
    console.log("observerWrite client:", client);

    // if (args.address.toLowerCase() === entryPoint07Address.toLowerCase()) {
    //   console.log("observerWrite handleOps", args);
    //   console.log("observerWrite args.args", args.args[0]);

    //   const arg = args.args[0][0];
    //   try {
    //     console.log("observerWrite arg", arg.callData);

    //     const decoded = decodeFunctionData({
    //       abi: parseAbi(["function execute(address target, uint256 value, bytes calldata data)"]),
    //       data: arg.callData,
    //     });

    //     console.log("observerWrite decoded", decoded);

    //     const decodedWorldCall = decodeFunctionData({
    //       abi: IBaseWorldAbi,
    //       data: decoded.args[2],
    //     });

    //     console.log("observerWrite decodedWorldCall", decodedWorldCall);
    //   } catch (error) {
    //     console.error("observerWrite error", error);
    //   }
    // }

    if (client.type === "bundlerClient") {
      console.log("observerWrite bundlerClient");

      return {
        async sendUserOperation(args) {
          console.log("observerWrite sendUserOperation", args);

          const write = getAction(client, sendUserOperation, "sendUserOperation")(args);
          const calls = args.calls;

          // for (const call of calls) {
          const call = calls[0];
          const writeId = `${client.uid}-${++writeCounter}`; // TODO: rename write to send ?
          const { to, args: args2, abi, functionName } = call;

          console.log("observerWrite call", call);

          const functionAbiItem = getAbiItem({
            abi,
            name: functionName,
            args,
          } as never)!;

          emit("write", {
            writeId,
            address: to, // args.address,
            from: client.account!.address,
            functionSignature: formatAbiItem(functionAbiItem),
            args: (args2.args ?? []) as never,
            value: args2.value,
          });

          write
            .then((hash) => {
              const receipt = getAction(client, waitForUserOperationReceipt, "waitForUserOperationReceipt")({ hash });

              Promise.allSettled([receipt])
                .then(async ([result]) => {
                  console.log("observerWrite waitForUserOperationReceipt result", result);
                  const txHash = result.value.receipt.transactionHash;
                  console.log("observerWrite tx hash:", txHash);

                  try {
                    const receipt3 = await getAction(
                      client,
                      waitForTransactionReceipt,
                      "waitForTransactionReceipt",
                    )({
                      hash: txHash,
                    });
                    console.log("observerWrite receipt3", receipt3);
                  } catch (error) {
                    console.log("observerWrite waitForTransactionReceipt error", error);
                  }

                  try {
                    console.log("observerWrite before receipt", txHash);

                    const receipt2 = getAction(
                      client,
                      waitForTransactionReceipt,
                      "waitForTransactionReceipt",
                    )({ hash: txHash });
                    console.log("observerWrite 1 receipt:".receipt2);

                    Promise.allSettled([receipt2])
                      .then(([result2]) => {
                        console.log("observerWrite 1 receipt result", result2);
                      })
                      .catch((error) => {
                        console.log("observerWrite waitForTransactionReceipt", error);
                      });
                  } catch (error) {
                    console.log("observerWrite waitForTransactionReceipt error", error);
                  }

                  emit("waitForTransactionReceipt", { hash: txHash, writeId });
                })
                .catch((error) => {
                  console.log("observerWrite fetching receipt", error);
                });
            })
            .catch((error) => {
              console.log("observerWrite waitForUserOperationReceipt error", error);
            });

          return write;
        },

        async writeContract(args) {
          console.log("(bundler client) observerWrite writeContract", args);

          return client.writeContract(args);
        },
      };
    }

    return {
      async writeContract(args) {
        console.log("(wallet client) observerWrite writeContract", args);

        if (args.address === entryPoint07Address) return;

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
    };
  };
}
