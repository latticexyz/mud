"use client";

import { LoaderIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { anvil } from "viem/chains";
import { useEffect, useState } from "react";
import { useChain } from "../../../../hooks/useChain";
import { useTableName } from "../../../../hooks/useTableName";
import { useDeployedTablesQuery } from "../../../../queries/useDeployedTablesQuery";
import { useTableDataQuery } from "../../../../queries/useTableDataQuery";
import { SQLEditor } from "./SQLEditor";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";

export function Explorer() {
  const { id: chainId } = useChain();
  const [query, setQuery] = useState("");
  const [selectedTableId] = useQueryState("tableId");
  const { data: deployedTables, isLoading: deployedTablesIsLoading } = useDeployedTablesQuery();
  const deployedTable = deployedTables?.find(({ tableId }) => tableId === selectedTableId);
  const tableName = useTableName(deployedTable);
  const { data: tableData, isLoading: tableDataIsLoading } = useTableDataQuery({ deployedTable, query });
  const isLoading = !deployedTable || !tableData || deployedTablesIsLoading || tableDataIsLoading;

  useEffect(() => {
    if (!deployedTable || !tableName) return;
    if (chainId === anvil.id) {
      setQuery(`SELECT * FROM "${tableName}"`);
    } else {
      setQuery(`SELECT ${Object.keys(deployedTable.schema).join(", ")} FROM ${tableName}`);
    }
  }, [chainId, deployedTable, setQuery, tableName]);

  return (
    <>
      {chainId !== anvil.id && <SQLEditor query={query} setQuery={setQuery} />}
      <TableSelector tables={deployedTables} />

      {isLoading && <LoaderIcon className="animate-spin" />}
      {!isLoading && <TablesViewer deployedTable={deployedTable} tableData={tableData} />}
    </>
  );
}
