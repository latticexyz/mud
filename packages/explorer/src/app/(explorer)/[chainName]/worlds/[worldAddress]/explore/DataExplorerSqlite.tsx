"use client";

import { useSearchParams } from "next/navigation";
import { useDeployedTablesQuery } from "../../../../../../queries/sqlite-indexer/useDeployedTablesQuery";
import { useTableDataQuery } from "../../../../../../queries/sqlite-indexer/useTableDataQuery";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";

export function DataExplorerSqlite() {
  const searchParams = useSearchParams();
  const { data: deployedTables } = useDeployedTablesQuery();
  const selectedTableId = searchParams.get("tableId") ?? deployedTables?.[0]?.tableId;
  const deployedTable = deployedTables?.find(({ tableId }) => tableId === selectedTableId);
  const { data } = useTableDataQuery({ deployedTable });

  return (
    <>
      <TableSelector value={selectedTableId} deployedTables={deployedTables} />
      <TablesViewer deployedTable={deployedTable} data={data} />
    </>
  );
}
