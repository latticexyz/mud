import { NavButton } from "../NavButton";
import { useTables } from "../tables/useTables";

export function TablesSummary() {
  const tables = useTables();
  return (
    <>
      {tables.length ? (
        <>
          <div className="flex flex-col gap-1 items-start">
            {tables.map((table) => (
              <NavButton to={`/tables/${table.component}`} className="font-mono text-xs hover:text-white">
                {table.tableId.namespace}:{table.tableId.name}
              </NavButton>
            ))}
          </div>
        </>
      ) : (
        <div>Waiting for tables…</div>
      )}
    </>
  );
}
