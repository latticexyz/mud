import { emitter as networkEmitter, Events as NetworkEvents } from "@latticexyz/network";
import { useEffect, useState } from "react";

type StoreEvent = NetworkEvents["storeEvent"];

export function useStoreEvents() {
  const [storeEvents, setStoreEvents] = useState<StoreEvent[]>([]);

  useEffect(() => {
    const listener = (storeEvent: StoreEvent) => {
      // TODO: narrow down to the chain/world we care about?
      setStoreEvents((storeEvents) => [...storeEvents, storeEvent]);
    };

    networkEmitter.on("storeEvent", listener);

    return () => {
      networkEmitter.off("storeEvent", listener);
    };
  }, []);

  return { storeEvents };
}
