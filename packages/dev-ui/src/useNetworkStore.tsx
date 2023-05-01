import {
  emitter,
  EmitterEvents,
  publicClient as publicClientObservable,
  walletClient as walletClientObservable,
} from "@latticexyz/network/dev";
import { PublicClient, WalletClient } from "viem";
import { create } from "zustand";

export type StoreEvent = EmitterEvents["storeEvent"];

export const useNetworkStore = create<{
  storeEvents: StoreEvent[];
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
  blockNumber: bigint | null;
}>(() => ({
  storeEvents: [],
  publicClient: null,
  walletClient: null,
  blockNumber: null,
}));

// TODO: clean up listeners

emitter.on("storeEvent", (storeEvent: StoreEvent) => {
  // TODO: narrow down to the chain/world we care about?
  useNetworkStore.setState((state) => ({ storeEvents: [...state.storeEvents, storeEvent] }));
});

publicClientObservable.subscribe((publicClient) => {
  useNetworkStore.setState({ publicClient });

  // TODO: unwatch if publicClient changes
  publicClient?.watchBlockNumber({
    onBlockNumber: (blockNumber) => {
      useNetworkStore.setState({ blockNumber });
    },
    emitOnBegin: true,
  });
});

walletClientObservable.subscribe((walletClient) => {
  useNetworkStore.setState({ walletClient });
});
