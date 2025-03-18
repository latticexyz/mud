"use client";

import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { Hex } from "viem";
import { useEffect, useState } from "react";
import { useChain } from "../../../../hooks/useChain";
import { usePrevious } from "../../../../hooks/usePrevious";
import { useTablesQuery } from "../../../../queries/useTablesQuery";
import { constructTableName } from "../../../../utils/constructTableName";
import { indexerForChainId } from "../../../../utils/indexerForChainId";
import { SQLEditor } from "./SQLEditor";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";
import { usePaginationState } from "./hooks/usePaginationState";
import { useSQLQueryState } from "./hooks/useSQLQueryState";

export function Explorer() {
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const indexer = indexerForChainId(chainId);
  const [isLiveQuery, setIsLiveQuery] = useState(indexer.type === "sqlite");
  const [{ pageSize }, setPagination] = usePaginationState();
  const [query, setQuery] = useSQLQueryState();
  const [selectedTableId] = useQueryState("tableId");
  const prevSelectedTableId = usePrevious(selectedTableId);
  const { data: tables } = useTablesQuery();
  const table = tables?.find(({ tableId }) => tableId === selectedTableId);

  useEffect(() => {
    if (table && (!query || prevSelectedTableId !== selectedTableId)) {
      const tableName = constructTableName(table, worldAddress as Hex, chainId);
      if (indexer.type === "sqlite") {
        setQuery(`SELECT * FROM "${tableName}" WHERE __isDeleted = 0;`);
      } else {
        const columns = Object.keys(table.schema).map((column) => `"${column}"`);
        setQuery(`SELECT ${columns.join(", ")} FROM "${tableName}" LIMIT ${pageSize} OFFSET 0;`);
        setPagination({
          pageIndex: 0,
          pageSize,
        });
      }
    }
  }, [
    chainId,
    setQuery,
    selectedTableId,
    table,
    worldAddress,
    prevSelectedTableId,
    query,
    indexer.type,
    pageSize,
    setPagination,
  ]);

  return (
    <div className="space-y-4">
      <TableSelector tables={tables} />
      {indexer.type !== "sqlite" && (
        <SQLEditor table={table} isLiveQuery={isLiveQuery} setIsLiveQuery={setIsLiveQuery} />
      )}
      <TablesViewer table={table} isLiveQuery={isLiveQuery} />
    </div>
  );
}
