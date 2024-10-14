import { useParams } from "next/navigation";
import { BaseError, Hex, TransactionReceipt, decodeFunctionData, parseEventLogs } from "viem";
import { useConfig, useWatchBlocks } from "wagmi";
import { getTransaction, simulateContract, waitForTransactionReceipt } from "wagmi/actions";
import { useStore } from "zustand";
import { useCallback, useEffect } from "react";
import { store as observerStore } from "../../../../../../observer/store";
import { useChain } from "../../../../hooks/useChain";
import { useWorldAbiQuery } from "../../../../queries/useWorldAbiQuery";
import { store as worldStore } from "../store";

export function TransactionsWatcher({ children }: { children: React.ReactNode }) {
  const { id: chainId } = useChain();
  const { worldAddress } = useParams();
  const wagmiConfig = useConfig();
  const { data: worldAbiData } = useWorldAbiQuery();
  const abi = worldAbiData?.abi;
  const { transactions, setTransaction, updateTransaction } = useStore(worldStore);
  const observerWrites = useStore(observerStore, (state) => state.writes);

  const handleTransaction = useCallback(
    async (hash: Hex, timestamp: bigint) => {
      if (!abi) return;

      const transaction = await getTransaction(wagmiConfig, { hash });
      if (transaction.to !== worldAddress) return;

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
    },
    [abi, wagmiConfig, worldAddress, observerWrites, setTransaction, updateTransaction],
  );

  useEffect(() => {
    for (const write of Object.values(observerWrites)) {
      const hash = write.hash;
      if (write.type === "waitForTransactionReceipt" && hash && write.address === worldAddress) {
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

  return children;
}
