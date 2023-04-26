import { emitter as devEmitter, Events as DevEvents } from "@latticexyz/common/dev";
import { useEffect, useState } from "react";

type StoreEvent = DevEvents["storeEvent"];

export function useStoreEvents() {
  const [storeEvents, setStoreEvents] = useState<StoreEvent[]>([]);

  useEffect(() => {
    const listener = (storeEvent: StoreEvent) => {
      // TODO: narrow down to the chain/world we care about?
      setStoreEvents((storeEvents) => [...storeEvents, storeEvent]);
    };

    devEmitter.on("storeEvent", listener);

    return () => {
      devEmitter.off("storeEvent", listener);
    };
  }, []);

  return { storeEvents };
}
