"use client";

import { Link2Icon, Link2OffIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Hex } from "viem";
import React, { useEffect, useMemo, useState } from "react";
import { useDozerQuery } from "../../../../../queries/useDozerQuery";
import { SQLEditor } from "./SQLEditor";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";
import { decode } from "./decode";

// TODO: use as params
const TABLE = "store__Tables";
const QUERY_COLUMNS = [
  "tableId",
  "fieldLayout",
  "keySchema",
  "valueSchema",
  "abiEncodedKeyNames",
  "abiEncodedFieldNames",
];
const QUERY = `select ${QUERY_COLUMNS.join(", ")} from ${TABLE}`;

export type Table = {
  key: string[];
  keySchema: Record<string, any>;
  name: string;
  namespace: string;
  schema: Record<string, any>;
  tableId: Hex;
  type: "offchainTable" | "table";
};

export function DozerListener() {
  const [query, setQuery] = useState();
  const { data } = useDozerQuery([TABLE], QUERY);
  const { columns, rows: encodedTables } = data || {};
  const tables = encodedTables?.map((table: Table) => decode(table));

  const tablesOptions = tables?.map((table: Table) => ({
    label: (
      <>
        {table.type === "offchainTable" && <Link2OffIcon className="mr-2 inline-block opacity-70" size={14} />}
        {table.type === "table" && <Link2Icon className="mr-2 inline-block opacity-70" size={14} />}
        {table.name} {table.namespace && <span className="opacity-70">({table.namespace})</span>}
      </>
    ),
    value: table.tableId,
  }));

  const searchParams = useSearchParams();
  const selectedTableId = searchParams.get("table") || (tablesOptions?.length > 0 ? tablesOptions[0].value : null);
  const tableData = tables?.find((table: Table) => table.tableId === selectedTableId);

  const dynamicQuery = useMemo(() => {
    if (!tableData) return;

    const schema = tableData?.schema;
    const keys = Object.keys(schema);

    return `SELECT ${keys.join(", ")} FROM ${tableData.name} LIMIT 100`;
  }, [tableData]);

  useEffect(() => {
    if (dynamicQuery) {
      setQuery(dynamicQuery);
    }
  }, [dynamicQuery]);

  return (
    <div>
      <SQLEditor query={query} setQuery={setQuery} />
      <TableSelector value={selectedTableId} options={tablesOptions} />
      <TablesViewer table={tableData} query={query} />
    </div>
  );
}
