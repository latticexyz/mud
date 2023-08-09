import { BehaviorSubject, Subject } from "rxjs";
import type { PublicClient, WalletClient, Chain, Transport } from "viem";
import type { CacheStore } from "../workers";
import { TableId } from "@latticexyz/common/deprecated";
import { StoreEvent, EphemeralEvent } from "../v2/common";

// TODO: connection status?
// TODO: sync status (rpc vs mode vs cache)

export const storeEvent$ = new Subject<{
  chainId: number;
  worldAddress: string;
  transactionHash: string;
  blockNumber: number;
  logIndex: number;
  event: StoreEvent | EphemeralEvent;
  table: TableId;
  keyTuple: any; // TODO: refine
  indexedValues?: Record<number, any>; // TODO: refine
  namedValues?: Record<string, any>; // TODO: refine
}>();

export const transactionHash$ = new Subject<string>();

// require chain for now so we can use it downstream
export const publicClient$: BehaviorSubject<PublicClient<Transport, Chain> | null> = new BehaviorSubject<PublicClient<
  Transport,
  Chain
> | null>(null);
// require chain for now so we can use it downstream
export const walletClient$: BehaviorSubject<WalletClient<Transport, Chain> | null> = new BehaviorSubject<WalletClient<
  Transport,
  Chain
> | null>(null);

export const cacheStore$ = new BehaviorSubject<CacheStore | null>(null);

export const worldAddress$ = new BehaviorSubject<string | null>(null);
