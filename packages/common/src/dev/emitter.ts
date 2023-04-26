import Emittery from "emittery";

export type StoreEvent = {
  name: "StoreSetRecord" | "StoreSetField" | "StoreDeleteRecord";
  // TODO: block number, log index, tx hash, etc.
  // TODO: unique ID for downstream ease of use (i.e. react keys)
  // TODO: flesh out, maybe from event abi using viem?
};

export type Events = {
  storeEvent: { chainId: number; worldAddress: string; storeEvent: StoreEvent };
  // TODO: connection status
  // TODO: sync status
  // TODO: user txs
};

export const emitter = new Emittery<Events>();
