import { NavButton } from "../NavButton";
import { useDevToolsContext } from "../DevToolsContext";
import { StorageOperationsTable } from "../events/StorageOperationsTable";

export function EventsSummary() {
  const { storageOperations } = useDevToolsContext();
  return (
    <>
      <StorageOperationsTable operations={storageOperations.slice(-10)} />
      <NavButton to="/events" className="block w-full bg-white/5 hover:bg-blue-700 hover:text-white">
        See more
      </NavButton>
    </>
  );
}
