"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDeployedTablesQuery } from "../../../../../../queries/dozer/useDeployedTablesQuery";
import { useTableDataQuery } from "../../../../../../queries/dozer/useTableDataQuery";
import { SQLEditor } from "./SQLEditor";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";

export function DataExplorerDozer() {
  const [query, setQuery] = useState<string | undefined>(undefined);
  const searchParams = useSearchParams();
  const { data: deployedTables } = useDeployedTablesQuery();
  const selectedTableId = searchParams.get("table") ?? deployedTables?.[0]?.tableId;
  const deployedTable = deployedTables?.find(({ tableId }) => tableId === selectedTableId);
  const {
    data: { rows, columns },
  } = useTableDataQuery({ schema: deployedTable?.schema, query });

  useEffect(() => {
    if (!deployedTable) return;

    const columns = Object.keys(deployedTable?.schema);
    const fullTableName = `${deployedTable.namespace}__${deployedTable.name}`;
    const newQuery = `select ${columns.join(", ")} from ${fullTableName}`;
    setQuery(newQuery);
  }, [deployedTable, selectedTableId]);

  return (
    <>
      <SQLEditor query={query} setQuery={setQuery} />
      <TableSelector value={selectedTableId} deployedTables={deployedTables} />
      <TablesViewer deployedTable={deployedTable} rows={rows} columns={columns} />
    </>
  );
}
