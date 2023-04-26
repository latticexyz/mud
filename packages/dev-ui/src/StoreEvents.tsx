import { useStoreEvents } from "./useStoreEvents";

export function StoreEvents() {
  const { storeEvents } = useStoreEvents();
  return (
    <div>
      {storeEvents.map((storeEvent, i) => (
        <div key={i}>{storeEvent.name}</div>
      ))}
    </div>
  );
}
