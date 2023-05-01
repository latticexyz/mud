import { emitter, EmitterEvents } from "@latticexyz/network/dev";
import { create } from "zustand";

type StoreEvent = EmitterEvents["storeEvent"];

export const useNetworkStore = create<{
  storeEvents: StoreEvent[];
}>(() => ({
  storeEvents: [],
}));

emitter.on("storeEvent", (storeEvent: StoreEvent) => {
  // TODO: narrow down to the chain/world we care about?
  useNetworkStore.setState((state) => ({ storeEvents: [...state.storeEvents, storeEvent] }));
});
