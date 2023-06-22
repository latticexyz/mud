import {
  storeEvent$,
  transactionHash$,
  publicClient$,
  walletClient$,
  cacheStore$,
  worldAddress$,
  worldAbi$,
} from "@latticexyz/network/dev";
import { PublicClient, WalletClient, Hex, Chain } from "viem";
import { Abi } from "abitype";
import { create } from "zustand";
import { CacheStore } from "@latticexyz/network";
import { ObservedValueOf } from "rxjs";
// TODO: fix, this store cache client is technically different than the one populated by store-cache itself (one is imported as part of the main package, the other as part of the /dev package)
import { storeCacheClient$ } from "@latticexyz/store-cache/dev";

export type StoreEvent = ObservedValueOf<typeof storeEvent$>;

export const useStore = create<{
  storeEvents: StoreEvent[];
  transactions: Hex[];
  cacheStore: CacheStore | null;
  storeCacheClient: ObservedValueOf<typeof storeCacheClient$> | null;
  publicClient: (PublicClient & { chain: Chain }) | null;
  walletClient: (WalletClient & { chain: Chain }) | null;
  blockNumber: bigint | null;
  worldAbi: Abi;
  worldAddress: string | null;
}>(() => ({
  storeEvents: [],
  transactions: [], // TODO: populate from recent wallet txs?
  cacheStore: null,
  storeCacheClient: null,
  publicClient: null,
  walletClient: null,
  blockNumber: null,
  worldAbi: worldAbi$.value,
  worldAddress: null,
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

storeCacheClient$.subscribe((storeCacheClient) => {
  useStore.setState({ storeCacheClient });
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
  useStore.setState({ worldAbi });
});

worldAddress$.subscribe((worldAddress) => {
  useStore.setState({ worldAddress });
});
