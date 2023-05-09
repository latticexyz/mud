import { storeEvent$, transactionHash$, publicClient$, walletClient$, cacheStore$ } from "@latticexyz/network/dev";
import { PublicClient, WalletClient, Hex, Chain } from "viem";
import { Abi } from "abitype";
import { create } from "zustand";
import { worldAbi$ } from "@latticexyz/std-client/dev";
import { CacheStore } from "@latticexyz/network";
import { IWorldKernel__factory } from "@latticexyz/world/types/ethers-contracts/factories/IWorldKernel.sol/IWorldKernel__factory";
import { ObservedValueOf } from "rxjs";

export type StoreEvent = ObservedValueOf<typeof storeEvent$>;

export const useStore = create<{
  storeEvents: StoreEvent[];
  transactions: Hex[];
  cacheStore: CacheStore | null;
  publicClient: (PublicClient & { chain: Chain }) | null;
  walletClient: (WalletClient & { chain: Chain }) | null;
  blockNumber: bigint | null;
  worldAbi: Abi;
}>(() => ({
  storeEvents: [],
  transactions: [], // TODO: populate from recent wallet txs?
  cacheStore: null,
  publicClient: null,
  walletClient: null,
  blockNumber: null,
  worldAbi: IWorldKernel__factory.abi,
}));

// TODO: clean up listeners

storeEvent$.subscribe((storeEvent) => {
  // TODO: narrow down to the chain/world we care about?
  useStore.setState((state) => ({
    storeEvents: [...state.storeEvents, storeEvent],
  }));
});

transactionHash$.subscribe((hash) => {
  const { publicClient } = useStore.getState();
  if (!publicClient) {
    console.log("Got transaction hash, but no public client to fetch it", hash);
    return;
  }

  useStore.setState((state) => ({
    transactions: [...state.transactions, hash as Hex],
  }));
});

cacheStore$.subscribe((cacheStore) => {
  useStore.setState({ cacheStore });
});

publicClient$.subscribe((publicClient) => {
  useStore.setState({ publicClient });

  // TODO: unwatch if publicClient changes
  publicClient?.watchBlockNumber({
    onBlockNumber: (blockNumber) => {
      useStore.setState({ blockNumber });
    },
    emitOnBegin: true,
  });
});

walletClient$.subscribe((walletClient) => {
  useStore.setState({ walletClient });
});

worldAbi$.subscribe((worldAbi) => {
  useStore.setState({ worldAbi: worldAbi ?? IWorldKernel__factory.abi });
});
