import { emitter as devEmitter, Events as DevEvents, StoreEvent } from "@latticexyz/common/dev";
import { useEffect, useState } from "react";

export function useStoreEvents() {
  const [storeEvents, setStoreEvents] = useState<StoreEvent[]>([]);

  useEffect(() => {
    const listener = ({ chainId, worldAddress, storeEvent }: DevEvents["storeEvent"]) => {
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
