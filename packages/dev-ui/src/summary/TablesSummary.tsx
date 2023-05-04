import { useStore } from "../useStore";
import { NavButton } from "../NavButton";
import { TransactionSummary } from "../actions/TransactionSummary";
import { useTables } from "../store-data/useTables";

export function TablesSummary() {
  const tables = useTables();

  return (
    <>
      {tables.length ? (
        <>
          <div className="flex flex-col gap-1 items-start">
            {tables.map((table) => (
              <NavButton to={`/store-data/${table.component}`} className="font-mono text-xs">
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
