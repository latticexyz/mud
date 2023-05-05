import { BehaviorSubject } from "rxjs";
import type { PublicClient, WalletClient, Chain } from "viem";
import type { CacheStore } from "../workers";

// require chain for now so we can use it downstream
export const publicClient: BehaviorSubject<(PublicClient & { chain: Chain }) | null> = new BehaviorSubject<
  (PublicClient & { chain: Chain }) | null
>(null);
// require chain for now so we can use it downstream
export const walletClient: BehaviorSubject<(WalletClient & { chain: Chain }) | null> = new BehaviorSubject<
  (WalletClient & { chain: Chain }) | null
>(null);

export const cacheStore = new BehaviorSubject<CacheStore | null>(null);
