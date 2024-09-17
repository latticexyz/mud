"use client";

import { Link2Icon, Link2OffIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useRowsQuery } from "../../../../../../queries/dozer/useRowsQuery";
import { useTablesQuery } from "../../../../../../queries/dozer/useTablesQuery";
import { SQLEditor } from "./SQLEditor";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";

export function DataExplorerRemote() {
  const [query, setQuery] = useState<string | undefined>(undefined);
  const searchParams = useSearchParams();

  const { data: tablesData } = useTablesQuery();
  const { selectedTableId, tablesOptions, config, schema } = useMemo(() => {
    const tablesOptions =
      tablesData?.map((table) => ({
        label: (
          <>
            {table.type === "offchainTable" && <Link2OffIcon className="mr-2 inline-block opacity-70" size={14} />}
            {table.type === "table" && <Link2Icon className="mr-2 inline-block opacity-70" size={14} />}
            {table.name} {table.namespace && <span className="opacity-70">({table.namespace})</span>}
          </>
        ),
        value: table.tableId,
      })) || [];
    const selectedTableId =
      searchParams.get("table") || (tablesOptions?.length > 0 ? tablesOptions[0].value : undefined);

    const config = tablesData?.find(({ tableId }) => tableId === selectedTableId);
    const schema = {
      ...config?.keySchema,
      ...config?.valueSchema,
    };

    return { selectedTableId, tablesOptions, config, schema };
  }, [searchParams, tablesData]);

  // TODO: type better with schema generic
  const { data } = useRowsQuery(schema, query);
  const { rows, columns } = data || {};

  useEffect(() => {
    if (!config) return;

    const columns = Object.keys(schema);
    const fullTableName = `${config.namespace}__${config.name}`;
    const newQuery = `select ${columns.join(", ")} from ${fullTableName}`;

    setQuery(newQuery);
  }, [config, schema, selectedTableId]);

  return (
    <>
      <SQLEditor query={query} setQuery={setQuery} />
      <TableSelector value={selectedTableId} options={tablesOptions} />
      <TablesViewer table={selectedTableId} config={config} rows={rows} columns={columns} />
    </>
  );
}
