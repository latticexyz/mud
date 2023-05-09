import Emittery from "emittery";
import { TableId } from "@latticexyz/utils";

// Expose a global emitter to ease in getting data from our internal packages to dev tools

export type EmitterEvents = {
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
  transaction: {
    hash: string;
  };
  // TODO: connection status?
  // TODO: sync status (rpc vs mode vs cache)
};

export const emitter = new Emittery<EmitterEvents>();
