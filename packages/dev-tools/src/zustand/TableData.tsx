import { useParams } from "react-router-dom";
import { TableDataTable } from "./TableDataTable";
import { useTables } from "./useTables";

// TODO: use react-table or similar for better perf with lots of logs

export function TableData() {
  const tables = useTables();

  const { id: idParam } = useParams();
  const table = tables.find((t) => t.tableId === idParam);

  // TODO: error message or redirect?
  if (!table) return null;

  // key here is useful to force a re-render on component changes,
  // otherwise state hangs around from previous render during navigation (entities)
  return <TableDataTable key={table.tableId} table={table} />;
}
