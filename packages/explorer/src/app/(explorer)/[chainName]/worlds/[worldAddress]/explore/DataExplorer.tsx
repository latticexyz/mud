"use client";

import { useSearchParams } from "next/navigation";
import { useDeployedTablesQuery } from "../../../../../../queries/useDeployedTablesQuery";
import { useTableDataQuery } from "../../../../../../queries/useTableDataQuery";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";

export function DataExplorer() {
  const searchParams = useSearchParams();
  const { data: deployedTables } = useDeployedTablesQuery();
  const selectedTableId = searchParams.get("tableId") ?? deployedTables?.[0]?.tableId;
  const deployedTable = deployedTables?.find(({ tableId }) => tableId === selectedTableId);
  const { data: tableData } = useTableDataQuery(deployedTable);

  console.log("table data", tableData);

  return (
    <>
      <TableSelector value={selectedTableId} deployedTables={deployedTables} />
      <TablesViewer deployedTable={deployedTable} data={tableData} />
    </>
  );
}
