"use client";

import { LoaderIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { anvil } from "viem/chains";
import { useEffect, useState } from "react";
import { useChain } from "../../../../hooks/useChain";
import { useTableId } from "../../../../hooks/useTableId";
import { useDeployedTablesQuery } from "../../../../queries/useDeployedTablesQuery";
import { useTableDataQuery } from "../../../../queries/useTableDataQuery";
import { SQLEditor } from "./SQLEditor";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";

export function Explorer() {
  const { id: chainId } = useChain();
  const [query, setQuery] = useState("");
  const [selectedTableId] = useQueryState("tableId");
  const { data: deployedTables } = useDeployedTablesQuery();
  const deployedTable = deployedTables?.find(({ tableId }) => tableId === selectedTableId);
  const tableId = useTableId(deployedTable);
  const { data: tableData } = useTableDataQuery({ deployedTable, query });
  const isLoading = !deployedTable || !tableData;

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
      <TableSelector tables={deployedTables} />

      {isLoading && <LoaderIcon className="animate-spin" />}
      {!isLoading && <TablesViewer deployedTable={deployedTable} tableData={tableData} />}
    </>
  );
}
