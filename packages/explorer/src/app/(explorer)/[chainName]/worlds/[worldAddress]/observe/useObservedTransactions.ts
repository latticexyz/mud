import { useParams } from "next/navigation";
import { Address, BaseError, Hex, Log, Transaction, TransactionReceipt, getAddress } from "viem";
import { useStore } from "zustand";
import { useMemo } from "react";
import { Message } from "../../../../../../observer/messages";
import { type Write, store as observerStore } from "../../../../../../observer/store";
import { store as worldStore } from "../store";

export type DecodedUserOperationCall = {
  to?: Address;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
};

export type ObservedTransaction = {
  writeId: string;
  hash?: Hex;
  from?: Address;
  timestamp?: bigint;
  transaction?: Transaction;
  calls: DecodedUserOperationCall[];
  value?: bigint;
  receipt?: TransactionReceipt;
  status: "pending" | "success" | "reverted" | "rejected" | "unknown";
  write?: Write;
  logs?: Log[];
  error?: BaseError;
};

export function useObservedTransactions() {
  const { worldAddress } = useParams<{ worldAddress: string }>();
  const transactions = useStore(worldStore, (state) => state.transactions);
  const observerWrites = useStore(observerStore, (state) => state.writes);
  const filteredObserverWrites = useMemo(() => {
    return Object.values(observerWrites)
      .map((write) => ({
        ...write,
        calls: write.calls.filter((call) => call.to && getAddress(call.to) === getAddress(worldAddress)),
      }))
      .filter(({ calls }) => calls.length > 0);
  }, [observerWrites, worldAddress]);

  const mergedTransactions = useMemo((): ObservedTransaction[] => {
    const mergedMap = new Map<string | undefined, ObservedTransaction>();

    for (const write of filteredObserverWrites) {
      const writeResult = write.events.find((event): event is Message<"write:result"> => event.type === "write:result");
      mergedMap.set(write.hash || write.writeId, {
        hash: write.hash,
        writeId: write.writeId,
        from: write.from,
        status: writeResult?.status === "rejected" ? "rejected" : "pending",
        timestamp: BigInt(write.time) / 1000n,
        calls: write.calls.filter((call) => call.to === worldAddress),
        error: writeResult && "reason" in writeResult ? (writeResult.reason as BaseError) : undefined,
        write,
      });
    }

    for (const transaction of transactions) {
      const existing = mergedMap.get(transaction.hash);
      if (existing) {
        mergedMap.set(transaction.hash, { ...transaction, write: existing.write });
      } else {
        mergedMap.set(transaction.hash, { ...transaction });
      }
    }

    return Array.from(mergedMap.values()).sort((a, b) => Number(b.timestamp ?? 0n) - Number(a.timestamp ?? 0n));
  }, [observerWrites, transactions]);

  return mergedTransactions;
}
