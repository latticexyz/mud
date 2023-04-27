import Emittery from "emittery";
import { TableId } from "@latticexyz/utils";
import type { CacheStore } from "../workers";

// Expose a global emitter to ease in getting data from our internals to the dev UI

export type Events = {
  storeEvent: {
    chainId: number;
    worldAddress: string;
    transactionHash: string;
    blockNumber: number;
    logIndex: number;
    event: "StoreSetRecord" | "StoreSetField" | "StoreDeleteRecord";
    table: TableId;
    keyTuple: any; // TODO: refine
    indexedValues?: Record<number, any>; // TODO: refine
    namedValues?: Record<string, any>; // TODO: refine
  };
  cacheStore: {
    cacheStore: CacheStore;
  };
  // TODO: connection status
  // TODO: sync status
  // TODO: user txs
};

export const emitter = new Emittery<Events>();
