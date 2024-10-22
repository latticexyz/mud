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

          // write
          //   .then((hash) => {
          //     console.log("observerWrite HASH IS:", hash);

          //     try {
          //       const userOpReceipt = getAction(
          //         client,
          //         waitForUserOperationReceipt,
          //         "waitForUserOperationReceipt",
          //       )({ hash });

          //       const txReceipt = getAction(client, getUserOperation, "getUserOperation")({ hash });

          //       Promise.allSettled([txReceipt]).then(([result]) => {
          //         console.log("observerWrite getUserOperation result", result);
          //       });

          //       Promise.allSettled([userOpReceipt]).then(([result]) => {
          //         console.log("observerWrite userOpReceipt result", result);

          //         const txHash = result.value.receipt.transactionHash;
          //         console.log("observerWrite txHash", txHash);
          //         // emit("waitForUserOperationReceipt:result", { ...result, writeId });
          //       });
          //     } catch (error) {
          //       console.error("observerWrite op error", error);
          //     }
          //   })
          //   .catch((error) => {
          //     console.error("observerWrite op error", error);
          //   });

          // try {
          //   console.log("WHY 1");
          //   const txReceipt = await getAction(
          //     client,
          //     waitForTransactionReceipt,
          //     "waitForTransactionReceipt",
          //   )({ hash: txHash });
          //   console.log("observerWrite txReceipt", txReceipt);
          // } catch (error) {
          //   console.error("observerWrite error", error);
          // }

          for (const call of calls) {
            const writeId = `${client.uid}-${++writeCounter}`; // TODO: rename write to send ?
            const { to, args, abi, functionName } = call;

            console.log("observerWrite call", call);

            // const userOpTxHash = getUserOperationHashV07(args, entryPoint07Address, client.chain.id);
            // console.log("observerWrite userOpTxHash", userOpTxHash);

            const functionAbiItem = getAbiItem({
              abi,
              name: functionName,
              args,
            } as never)!;

            // console.log(writeId, args, client, functionAbiItem, args.args, args.value);

            // const userOperationHash = getUserOperationHash({
            //   ...args,
            //   entryPointAddress: entryPoint07Address,
            //   chainId: client.chain.id,
            // });

            emit("write", {
              writeId,
              address: to, // args.address,
              from: client.account!.address,
              functionSignature: formatAbiItem(functionAbiItem),
              args: (args.args ?? []) as never,
              value: args.value,
            });

            write.then((hash) => {
              console.log("observerWrite HASH IS:", hash, "writeId is:", writeId);

              const receipt = getAction(client, waitForUserOperationReceipt, "waitForUserOperationReceipt")({ hash });

              // emit("waitForTransactionReceipt", { writeId, hash });
              Promise.allSettled([receipt]).then(([result]) => {
                console.log("observerWrite waitForUserOperationReceipt result", result);

                const txHash = result.value.receipt.transactionHash;
                console.log("observerWrite tx hash", txHash);

                emit("waitForTransactionReceipt", { hash: txHash, writeId });
              });
            });

            // write.then((hash) => {
            // emit("waitForTransactionReceipt", { writeId, hash });
            // Promise.allSettled([receipt]).then(([result]) => {
            //   emit("waitForTransactionReceipt:result", { ...result, writeId });
            // });
            // });

            // Promise.allSettled([write]).then(([result]) => {
            //   emit("write:result", { ...result, writeId });
            // });
          }

          // write.then((hash) => {
          //   console.log("observerWrite hash", hash);

          //   const receipt = getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({ hash });
          //   const receipt2 = getAction(client, waitForUserOperationReceipt, "waitForUserOperationReceipt")({ hash });

          //   Promise.allSettled([receipt, receipt2]).then(([result, result2]) => {
          //     console.log("observerWrite result", result);
          //     console.log("observerWrite result2", result2);
          //   });
          // });

          // write.then((hash) => {
          //   console.log("observerWrite write then!", hash);

          //   const receipt = getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({ hash });
          //   Promise.allSettled([receipt]).then(([result]) => {
          //     console.log("observerWrite result receipt:", result);

          //     // emit("waitForTransactionReceipt:result", { ...result, writeId });
          //   });

          //   // emit("write:result", { hash, writeId });
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
