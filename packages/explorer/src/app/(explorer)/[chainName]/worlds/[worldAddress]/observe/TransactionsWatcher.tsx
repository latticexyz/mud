import { useParams } from "next/navigation";
import {
  Address,
  BaseError,
  Hash,
  TransactionReceipt,
  decodeFunctionData,
  getAbiItem,
  getAddress,
  parseAbi,
  parseEventLogs,
} from "viem";
import { PackedUserOperation, entryPoint07Abi, entryPoint07Address } from "viem/account-abstraction";
import { formatAbiItem } from "viem/utils";
import { useConfig, useWatchBlocks } from "wagmi";
import { getTransaction, simulateContract, waitForTransactionReceipt } from "wagmi/actions";
import { useStore } from "zustand";
import { useCallback, useEffect } from "react";
import { store as observerStore } from "../../../../../../observer/store";
import { useChain } from "../../../../hooks/useChain";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { store as worldStore } from "../store";
import { doomWorldAbi, userOperationEventAbi } from "./abis";

export function TransactionsWatcher() {
  const { id: chainId } = useChain();
  const { worldAddress } = useParams<{ worldAddress: Address }>();
  const wagmiConfig = useConfig();
  const { data: worldAbiData } = useWorldAbiQuery();
  const abi = worldAbiData?.abi;
  const { transactions, setTransaction, updateTransaction } = useStore(worldStore);
  const observerWrites = useStore(observerStore, (state) => state.writes);

  const handleTransaction = useCallback(
    async ({ hash, writeId, timestamp }: { hash: Hash; timestamp: bigint; writeId?: string }) => {
      if (!abi) return;

      const transaction = await getTransaction(wagmiConfig, { hash });
      if (transaction.to && getAddress(transaction.to) === getAddress(entryPoint07Address)) {
        const write = writeId ? observerWrites[writeId] : undefined;
        if (!write) return;

        const receipt = write["events"].find((event) => event.type === "waitForUserOperationReceipt:result")?.receipt;
        if (!receipt) return;

        const hash = receipt.transactionHash;
        const decodedEntryPointCall = decodeFunctionData({
          abi: entryPoint07Abi,
          data: transaction.input,
        });

        const userOps = decodedEntryPointCall.args[0] as PackedUserOperation[];
        const worldTo = decodedEntryPointCall.args[1] as Address;
        let calls;

        // TODO: handle several userOps
        for (const userOp of userOps) {
          const decodedSmartAccountCall = decodeFunctionData({
            abi: parseAbi([
              "function execute(address target, uint256 value, bytes calldata data)",
              "function executeBatch((address target,uint256 value,bytes data)[])",
            ]),
            data: userOp.callData,
          });

          const { functionName: decodedFunctionName, args: decodedArgs } = decodedSmartAccountCall;
          if (decodedFunctionName === "execute") {
            const target = decodedArgs[0];
            const value = decodedArgs[1]; // TODO: handle value
            const data = decodedArgs[2];

            let functionName: string | undefined;
            let args: readonly unknown[] | undefined;
            // let transactionError: BaseError | undefined; // TODO: what to do with this?
            try {
              const functionData = decodeFunctionData({ abi: doomWorldAbi, data });
              functionName = functionData.functionName;
              args = functionData.args;
            } catch (error) {
              // transactionError = error as BaseError;
              functionName = transaction.input.length > 10 ? transaction.input.slice(0, 10) : "unknown";
            }

            const functionAbiItem = getAbiItem({
              abi: doomWorldAbi,
              name: functionName,
              args,
            } as never);

            calls = {
              to: target,
              functionSignature: functionAbiItem ? formatAbiItem(functionAbiItem) : "unknown",
              functionName,
              args,
            };
          } else if (decodedFunctionName === "executeBatch") {
            calls = decodedArgs[0].map((worldFunction) => {
              let functionName: string | undefined;
              let args: readonly unknown[] | undefined;
              // let transactionError: BaseError | undefined; // TODO: what to do with this?
              try {
                const functionData = decodeFunctionData({ abi: doomWorldAbi, data: worldFunction.data });
                functionName = functionData.functionName;
                args = functionData.args;
              } catch (error) {
                // transactionError = error as BaseError;
                functionName = transaction.input.length > 10 ? transaction.input.slice(0, 10) : "unknown";
              }

              const functionAbiItem = getAbiItem({
                abi: doomWorldAbi,
                name: functionName,
                args,
              } as never);

              return {
                to: worldFunction.target,
                functionSignature: functionAbiItem ? formatAbiItem(functionAbiItem) : "unknown",
                functionName,
                args,
              };
            });
          }

          setTransaction({
            hash,
            writeId: writeId ?? hash,
            from: transaction.from,
            timestamp,
            transaction,
            status: "pending",
            calls,
            value: transaction.value,
          });

          const logs = parseEventLogs({
            abi: [...abi, userOperationEventAbi],
            logs: receipt.logs,
          });

          updateTransaction(hash, {
            receipt,
            logs,
            status: "success", // TODO: correct status check
            error: undefined, // TODO: transactionError as BaseError,
          });

          return;
        }
      } else if (transaction.to && getAddress(transaction.to) === getAddress(worldAddress)) {
        let functionName: string | undefined;
        let args: readonly unknown[] | undefined;
        let transactionError: BaseError | undefined;

        try {
          const functionData = decodeFunctionData({ abi, data: transaction.input });
          functionName = functionData.functionName;
          args = functionData.args;
        } catch (error) {
          transactionError = error as BaseError;
          functionName = transaction.input.length > 10 ? transaction.input.slice(0, 10) : "unknown";
        }

        setTransaction({
          hash,
          writeId: writeId ?? hash,
          from: transaction.from,
          timestamp,
          transaction,
          status: "pending",
          calls: {
            functionName,
            args,
          },
          value: transaction.value,
        });

        // TODO: reuse receipt from observer if tx successful
        let receipt: TransactionReceipt | undefined;
        try {
          receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
        } catch {
          console.error(`Failed to fetch transaction receipt. Transaction hash: ${hash}`);
        }

        if (receipt && receipt.status === "reverted" && functionName) {
          try {
            // Simulate the failed transaction to retrieve the revert reason
            // Note, it only works for functions that are declared in the ABI
            // See: https://github.com/wevm/viem/discussions/462
            await simulateContract(wagmiConfig, {
              account: transaction.from,
              address: worldAddress,
              abi,
              value: transaction.value,
              blockNumber: receipt.blockNumber,
              functionName,
              args,
            });
          } catch (error) {
            transactionError = error as BaseError;
          }
        }

        const status = receipt ? receipt.status : "unknown";
        const logs = parseEventLogs({
          abi,
          logs: receipt?.logs || [],
        });

        updateTransaction(hash, {
          receipt,
          logs,
          status,
          error: transactionError as BaseError,
        });
      }
    },
    [abi, wagmiConfig, worldAddress, observerWrites, setTransaction, updateTransaction],
  );

  useEffect(() => {
    for (const { hash, writeId, time } of Object.values(observerWrites)) {
      if (hash) {
        const transaction = transactions.find((transaction) => transaction.hash === hash);
        if (!transaction) {
          handleTransaction({ hash, writeId, timestamp: BigInt(time) / 1000n });
        }
      }
    }
  }, [handleTransaction, observerWrites, transactions, worldAddress]);

  useWatchBlocks({
    onBlock(block) {
      for (const hash of block.transactions) {
        if (transactions.find((transaction) => transaction.hash === hash)) continue;
        handleTransaction({ hash, timestamp: block.timestamp });
      }
    },
    chainId,
    pollingInterval: 500,
  });

  return null;
}
