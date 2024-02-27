import { resourceToLabel } from "@latticexyz/common";
import { NavButton } from "../NavButton";
import { useTables } from "../zustand/useTables";

export function TablesSummary() {
  const tables = useTables();
  return (
    <div className="flex flex-col gap-1 items-start">
      {tables.map((table) => (
        <NavButton key={table.tableId} to={`/tables/${table.tableId}`} className="font-mono text-xs hover:text-white">
          {resourceToLabel(table)}
        </NavButton>
      ))}
    </div>
  );
}
