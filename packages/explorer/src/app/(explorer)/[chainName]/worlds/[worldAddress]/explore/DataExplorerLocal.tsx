"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  // useMUDConfigQuery,
  // useRowsQuery,
  // useSchemaQuery,
  useTablesQuery,
} from "../../../../../../queries/sqlite-indexer";
import { SQLEditor } from "./SQLEditor";
import { TableSelector } from "./TableSelector";

// import { TablesViewer } from "./TablesViewer";

export function DataExplorerLocal() {
  const [query, setQuery] = useState<string | undefined>(undefined);
  const searchParams = useSearchParams();

  const { data: tables } = useTablesQuery();
  const selectedTable = searchParams.get("table") || (tables?.length > 0 ? tables[0] : null);

  // const { data: schema } = useSchemaQuery(selectedTable);
  // const { data: rows } = useRowsQuery(selectedTable);
  // const { data: mudTableConfig } = useMUDConfigQuery(selectedTable);

  useEffect(() => {
    if (selectedTable) {
      // TODO: make query be reflected in the rows
      setQuery(`SELECT * FROM ${selectedTable} LIMIT 30`);
    }
  }, [selectedTable]);

  return (
    <>
      <SQLEditor query={query} setQuery={setQuery} />
      <TableSelector value={selectedTable} options={tables} />
      {/* <TablesViewer table={selectedTable} mudTableConfig={mudTableConfig} rows={rows} /> */}
    </>
  );
}
