import { StoreEventsTable } from "../store-log/StoreEventsTable";
import { useStore } from "../useStore";
import { NavButton } from "../NavButton";

export function StoreEventsSummary() {
  const recentStoreEvents = useStore((state) => state.storeEvents.slice(-10).reverse());

  return (
    <>
      <StoreEventsTable storeEvents={recentStoreEvents} />
      <NavButton to="/store-log" className="block w-full bg-white/5 hover:bg-blue-700 hover:text-white">
        See more
      </NavButton>
    </>
  );
}
