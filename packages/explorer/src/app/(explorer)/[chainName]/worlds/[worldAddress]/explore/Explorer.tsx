"use client";

import { useParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { Hex } from "viem";
import { useEffect } from "react";
import { useChain } from "../../../../hooks/useChain";
import { usePrevious } from "../../../../hooks/usePrevious";
import { useTableDataQuery } from "../../../../queries/useTableDataQuery";
import { useTablesQuery } from "../../../../queries/useTablesQuery";
import { constructTableName } from "../../../../utils/constructTableName";
import { indexerForChainId } from "../../../../utils/indexerForChainId";
import { SQLEditor } from "./SQLEditor";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";

export function Explorer() {
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const indexer = indexerForChainId(chainId);
  const [query, setQuery] = useQueryState("query", parseAsString.withDefault(""));
  const [selectedTableId] = useQueryState("tableId");
  const prevSelectedTableId = usePrevious(selectedTableId);

  const { data: tables } = useTablesQuery();
  const table = tables?.find(({ tableId }) => tableId === selectedTableId);
  const { data: tableData, isLoading, isFetched } = useTableDataQuery({ table, query });

  useEffect(() => {
    if (table && (!query || prevSelectedTableId !== selectedTableId)) {
      const tableName = constructTableName(table, worldAddress as Hex, chainId);

      if (indexer.type === "sqlite") {
        setQuery(`SELECT * FROM "${tableName}"`);
      } else {
        setQuery(`SELECT ${Object.keys(table.schema).join(", ")} FROM ${tableName}`);
      }
    }
  }, [chainId, setQuery, selectedTableId, table, worldAddress, prevSelectedTableId, query, indexer.type]);

  return (
    <>
      {indexer.type !== "sqlite" && <SQLEditor />}
      <TableSelector tables={tables} />
      <TablesViewer table={table} tableData={tableData} isLoading={isLoading || !isFetched} />
    </>
  );
}
