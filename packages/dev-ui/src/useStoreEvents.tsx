import { emitter as networkEmitter, Events as NetworkEvents } from "@latticexyz/network";
import { create } from "zustand";

type StoreEvent = NetworkEvents["storeEvent"];

const useStore = create<{ storeEvents: StoreEvent[] }>(() => ({
  storeEvents: [],
}));

networkEmitter.on("storeEvent", (storeEvent: StoreEvent) => {
  // TODO: narrow down to the chain/world we care about?
  useStore.setState((state) => ({ storeEvents: [...state.storeEvents, storeEvent] }));
});

export function useStoreEvents() {
  return useStore((state) => ({ storeEvents: state.storeEvents }));
}
