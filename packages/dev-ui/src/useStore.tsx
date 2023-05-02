import {
  emitter,
  EmitterEvents,
  publicClient as publicClientObservable,
  walletClient as walletClientObservable,
} from "@latticexyz/network/dev";
import { PublicClient, Transaction, WalletClient, Hex, TransactionReceipt } from "viem";
import { create } from "zustand";
import { dev as stdClientDev } from "@latticexyz/std-client";

export type StoreEvent = EmitterEvents["storeEvent"];
export type TransactionInfo = {
  hash: Hex;
  transaction: Promise<Transaction>;
  transactionReceipt: Promise<TransactionReceipt>;
};

export const useStore = create<{
  storeEvents: StoreEvent[];
  transactions: TransactionInfo[];
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
  blockNumber: bigint | null;
  // TODO: use Abi from abitype
  worldAbi: any | null;
}>(() => ({
  storeEvents: [],
  transactions: [],
  publicClient: null,
  walletClient: null,
  blockNumber: null,
  worldAbi: null,
}));

// TODO: clean up listeners

emitter.on("storeEvent", (storeEvent) => {
  // TODO: narrow down to the chain/world we care about?
  useStore.setState((state) => ({
    storeEvents: [...state.storeEvents, storeEvent],
  }));
});

emitter.on("transaction", ({ hash }) => {
  const { publicClient } = useStore.getState();
  if (!publicClient) {
    console.log("Got transaction hash, but no public client to fetch it", hash);
    return;
  }

  const transaction = publicClient.getTransaction({ hash: hash as Hex });
  const transactionReceipt = publicClient.waitForTransactionReceipt({ hash: hash as Hex });
  // TODO: handle replacements?
  useStore.setState((state) => ({
    transactions: [...state.transactions, { hash: hash as Hex, transaction, transactionReceipt }],
  }));
});

publicClientObservable.subscribe((publicClient) => {
  useStore.setState({ publicClient });

  // TODO: unwatch if publicClient changes
  publicClient?.watchBlockNumber({
    onBlockNumber: (blockNumber) => {
      useStore.setState({ blockNumber });
    },
    emitOnBegin: true,
  });
});

walletClientObservable.subscribe((walletClient) => {
  useStore.setState({ walletClient });
});

stdClientDev.worldAbiObservable.subscribe((worldAbi) => {
  useStore.setState({ worldAbi });
});
