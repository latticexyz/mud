"use client";

import { useSearchParams } from "next/navigation";
import { anvil } from "viem/chains";
import { useEffect, useState } from "react";
import { useChain } from "../../../../../../hooks/useChain";
import { useTableId } from "../../../../../../hooks/useTableId";
import { useDeployedTablesQuery } from "../queries/useDeployedTablesQuery";
import { useTableDataQuery } from "../queries/useTableDataQuery";
import { SQLEditor } from "./SQLEditor";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";

export function Explorer() {
  const { id: chainId } = useChain();
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const { data: deployedTables } = useDeployedTablesQuery();
  const selectedTableId = searchParams.get("tableId") ?? deployedTables?.[0]?.tableId;
  const deployedTable = deployedTables?.find(({ tableId }) => tableId === selectedTableId);
  const tableId = useTableId(deployedTable);
  const { data: tableData, isLoading } = useTableDataQuery({ deployedTable, query });

  useEffect(() => {
    if (!deployedTable || !tableId) return;
    if (chainId === anvil.id) {
      setQuery(`SELECT * FROM "${tableId}"`);
    } else {
      setQuery(`SELECT ${Object.keys(deployedTable.schema).join(", ")} FROM ${tableId}`);
    }
  }, [chainId, deployedTable, tableId]);

  return (
    <>
      {chainId !== anvil.id && <SQLEditor query={query} setQuery={setQuery} />}
      <TableSelector value={selectedTableId} deployedTables={deployedTables} />
      <TablesViewer deployedTable={deployedTable} data={tableData} isLoading={isLoading} />
    </>
  );
}
