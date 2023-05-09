import { EventsTable } from "../events/EventsTable";
import { useStore } from "../useStore";
import { NavButton } from "../NavButton";

export function EventsSummary() {
  const events = useStore((state) => state.storeEvents.slice(-10).reverse());
  return (
    <>
      <EventsTable events={events} />
      <NavButton to="/events" className="block w-full bg-white/5 hover:bg-blue-700 hover:text-white">
        See more
      </NavButton>
    </>
  );
}
