import { useParams } from "next/navigation";
import { BaseError, Hex, TransactionReceipt, decodeFunctionData, parseAbi, parseEventLogs } from "viem";
import { PackedUserOperation, entryPoint07Abi, entryPoint07Address } from "viem/account-abstraction";
import { useConfig, useWatchBlocks } from "wagmi";
import { getTransaction, simulateContract, waitForTransactionReceipt } from "wagmi/actions";
import { useStore } from "zustand";
import { useCallback, useEffect } from "react";
import { store as observerStore } from "../../../../../../observer/store";
import { useChain } from "../../../../hooks/useChain";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { store as worldStore } from "../store";

export function TransactionsWatcher() {
  const { id: chainId } = useChain();
  const { worldAddress } = useParams<{ worldAddress: string }>();
  const wagmiConfig = useConfig();
  const { data: worldAbiData } = useWorldAbiQuery();
  const abi = worldAbiData?.abi;
  const { transactions, setTransaction, updateTransaction } = useStore(worldStore);
  const observerWrites = useStore(observerStore, (state) => state.writes);

  const handleTransaction = useCallback(
    async (hash: Hex, timestamp: bigint) => {
      if (!abi) return;

      const transaction = await getTransaction(wagmiConfig, { hash });

      if (transaction.to.toLowerCase() === entryPoint07Address.toLowerCase()) {
        console.log("user operation 111:");

        const decodedEntryPointCall = decodeFunctionData({
          abi: entryPoint07Abi,
          data: transaction.input,
        });

        const userOps = decodedEntryPointCall.args[0] as PackedUserOperation[];
        console.log("user operations", userOps);

        const decodedSmartAccountCall = decodeFunctionData({
          abi: parseAbi(["function execute(address target, uint256 value, bytes calldata data)"]),
          data: userOps[0].callData,
        });

        console.log("user operation 222:", decodedSmartAccountCall);

        // const to = decodedSmartAccountCall.args[0];
        // const value = decodedSmartAccountCall.args[1];
        const data = decodedSmartAccountCall.args[2];

        // console.log("user operation functionData2", functionData2);

        let functionName: string | undefined;
        let args: readonly unknown[] | undefined;
        let transactionError: BaseError | undefined;

        try {
          const functionData = decodeFunctionData({ abi, data });

          functionName = functionData.functionName;
          args = functionData.args;
        } catch (error) {
          transactionError = error as BaseError;
          functionName = transaction.input.length > 10 ? transaction.input.slice(0, 10) : "unknown";
        }

        const write = Object.values(observerWrites).find((write) => write.hash === hash);
        setTransaction({
          hash,
          writeId: write?.writeId ?? hash,
          from: transaction.from,
          timestamp,
          transaction,
          status: "pending",
          functionData: {
            functionName,
            args,
          },
          value: transaction.value,
        });

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
      } else if (transaction.to === worldAddress) {
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

        const write = Object.values(observerWrites).find((write) => write.hash === hash);
        setTransaction({
          hash,
          writeId: write?.writeId ?? hash,
          from: transaction.from,
          timestamp,
          transaction,
          status: "pending",
          functionData: {
            functionName,
            args,
          },
          value: transaction.value,
        });

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
    for (const write of Object.values(observerWrites)) {
      const hash = write.hash;
      if (hash) {
        // TODO: add back -> && write.address.toLowerCase() === worldAddress.toLowerCase()
        const transaction = transactions.find((transaction) => transaction.hash === hash);
        if (!transaction) {
          handleTransaction(hash, BigInt(write.time) / 1000n);
        }
      }
    }
  }, [handleTransaction, observerWrites, transactions, worldAddress]);

  useWatchBlocks({
    onBlock(block) {
      for (const hash of block.transactions) {
        if (transactions.find((transaction) => transaction.hash === hash)) continue;
        handleTransaction(hash, block.timestamp);
      }
    },
    chainId,
    pollingInterval: 500,
  });

  return null;
}
