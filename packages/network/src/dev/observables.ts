import { BehaviorSubject } from "rxjs";
import { PublicClient, WalletClient } from "viem";
import type { CacheStore } from "../workers";

export const publicClient: BehaviorSubject<PublicClient | null> = new BehaviorSubject<PublicClient | null>(null);
export const walletClient: BehaviorSubject<WalletClient | null> = new BehaviorSubject<WalletClient | null>(null);
export const cacheStore = new BehaviorSubject<CacheStore | null>(null);
