import { useParams } from "next/navigation";
import {
  AbiFunction,
  Address,
  BaseError,
  DecodeFunctionDataReturnType,
  Hex,
  Log,
  Transaction,
  TransactionReceipt,
  parseAbiItem,
} from "viem";
import { useStore } from "zustand";
import { useMemo } from "react";
import { Message } from "../../../../../../observer/messages";
import { type Write, store as observerStore } from "../../../../../../observer/store";
import { store as worldStore } from "../store";

export type ObservedTransaction = {
  writeId: string;
  hash?: Hex;
  from?: Address;
  timestamp?: bigint;
  transaction?: Transaction;
  functionData?: DecodeFunctionDataReturnType;
  value?: bigint;
  receipt?: TransactionReceipt;
  status: "pending" | "success" | "reverted" | "rejected" | "unknown";
  write?: Write;
  logs?: Log[];
  error?: BaseError;
};

export function useObservedTransactions() {
  const { worldAddress } = useParams();
  const transactions = useStore(worldStore, (state) => state.transactions);
  const observerWrites = useStore(observerStore, (state) => state.writes);

  const mergedTransactions = useMemo((): ObservedTransaction[] => {
    const mergedMap = new Map<string | undefined, ObservedTransaction>();

    for (const write of Object.values(observerWrites)) {
      if (write.address !== worldAddress) continue;

      const parsedAbiItem = parseAbiItem(`function ${write.functionSignature}`) as AbiFunction;
      const writeResult = write.events.find((event): event is Message<"write:result"> => event.type === "write:result");

      mergedMap.set(write.hash || write.writeId, {
        hash: write.hash,
        writeId: write.writeId,
        from: write.from,
        status: writeResult?.status === "rejected" ? "rejected" : "pending",
        timestamp: BigInt(write.time) / 1000n,
        functionData: {
          functionName: parsedAbiItem.name,
          args: write.args,
        },
        value: write.value,
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
  }, [observerWrites, worldAddress, transactions]);

  return mergedTransactions;
}
