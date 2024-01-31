import { NavButton } from "../NavButton";
import { useDevToolsContext } from "../DevToolsContext";
import { LogsTable } from "../events/LogsTable";

export function EventsSummary() {
  const { storedLogs } = useDevToolsContext();
  return (
    <>
      <LogsTable logs={storedLogs.slice(-10)} />
      <NavButton to="/events" className="block w-full bg-white/5 hover:bg-blue-700 hover:text-white">
        See more
      </NavButton>
    </>
  );
}
