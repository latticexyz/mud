"use client";

import { useParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { Hex } from "viem";
import { anvil } from "viem/chains";
import { useEffect } from "react";
import { useChain } from "../../../../hooks/useChain";
import { getTableName } from "../../../../lib/getTableName";
import { useDeployedTablesQuery } from "../../../../queries/useDeployedTablesQuery";
import { useTableDataQuery } from "../../../../queries/useTableDataQuery";
import { SQLEditor } from "./SQLEditor";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";

export function Explorer() {
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const [query, setQuery] = useQueryState("query", parseAsString.withDefault(""));
  const [selectedTableId] = useQueryState("tableId");

  const { data: deployedTables } = useDeployedTablesQuery();
  const deployedTable = deployedTables?.find(({ tableId }) => tableId === selectedTableId);
  const { data: tableData, isLoading, isFetched } = useTableDataQuery({ deployedTable, query });

  useEffect(() => {
    if (!deployedTable) return;

    const tableName = getTableName(deployedTable, worldAddress as Hex, chainId);
    if (chainId === anvil.id) {
      setQuery(`SELECT * FROM "${tableName}"`);
    } else {
      setQuery(`SELECT ${Object.keys(deployedTable.schema).join(", ")} FROM ${tableName}`);
    }
  }, [chainId, setQuery, selectedTableId, deployedTable, worldAddress]);

  return (
    <>
      {chainId !== anvil.id && <SQLEditor />}
      <TableSelector tables={deployedTables} />
      <TablesViewer deployedTable={deployedTable} tableData={tableData} isLoading={isLoading || !isFetched} />
    </>
  );
}
