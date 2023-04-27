import Emittery from "emittery";
// TODO: move TableId into common
import { TableId } from "@latticexyz/utils";

// This is a global emitter to ease in getting data from our internals to the dev UI.
// Otherwise, you might to pass all sorts of world/network state into the dev UI before
// it can bootstrap.

export type Events = {
  storeEvent: {
    chainId: number;
    worldAddress: string;
    blockNumber: number;
    // TODO: block number, log index, tx hash, etc.
    event: "StoreSetRecord" | "StoreSetField" | "StoreDeleteRecord";
    table: TableId;
    keyTuple: any; // TODO: refine
    indexedValues?: Record<number, any>; // TODO: refine
    namedValues?: Record<string, any>; // TODO: refine
    // TODO: unique ID for downstream ease of use (i.e. react keys)
    // TODO: flesh out, maybe from event abi using viem?
  };
  // TODO: connection status
  // TODO: sync status
  // TODO: user txs
};

export const emitter = new Emittery<Events>();
