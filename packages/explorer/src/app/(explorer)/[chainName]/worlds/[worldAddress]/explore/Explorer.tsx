"use client";

import { useParams } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { Hex } from "viem";
import { useEffect } from "react";
import { useChain } from "../../../../hooks/useChain";
import { usePrevious } from "../../../../hooks/usePrevious";
import { useTableDataQuery } from "../../../../queries/useTableDataQuery";
import { useTablesConfigQuery } from "../../../../queries/useTablesConfigQuery";
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

  const { data: tablesConfig } = useTablesConfigQuery();
  const tableConfig = tablesConfig?.find(({ tableId }) => tableId === selectedTableId);
  const { data: tableData, isLoading, isFetched } = useTableDataQuery({ tableConfig, query });

  useEffect(() => {
    if (tableConfig && (!query || prevSelectedTableId !== selectedTableId)) {
      const tableName = constructTableName(tableConfig, worldAddress as Hex, chainId);

      if (indexer.type === "sqlite") {
        setQuery(`SELECT * FROM "${tableName}"`);
      } else {
        setQuery(`SELECT ${Object.keys(tableConfig.schema).join(", ")} FROM ${tableName}`);
      }
    }
  }, [chainId, setQuery, selectedTableId, tableConfig, worldAddress, prevSelectedTableId, query, indexer.type]);

  return (
    <>
      {indexer.type !== "sqlite" && <SQLEditor />}
      <TableSelector tablesConfig={tablesConfig} />
      <TablesViewer tableConfig={tableConfig} tableData={tableData} isLoading={isLoading || !isFetched} />
    </>
  );
}
