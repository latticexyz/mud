import { useStoreEvents } from "./useStoreEvents";

export function StoreEvents() {
  const { storeEvents } = useStoreEvents();
  return (
    <div>
      {storeEvents.map((storeEvent, i) => (
        <div key={i}>
          {storeEvent.table.namespace}:{storeEvent.table.name} {storeEvent.keyTuple}
        </div>
      ))}
    </div>
  );
}
