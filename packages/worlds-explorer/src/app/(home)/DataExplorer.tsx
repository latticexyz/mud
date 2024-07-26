"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { SQLEditor } from "./SQLEditor";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";

export function DataExplorer() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string | undefined>();
  const { data: tables, isLoading: tablesLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await fetch("/api/tables");
      return response.json();
    },
    select: (data) => data.tables.map((table: { name: string }) => table.name),
    refetchInterval: 15000,
  });
  const selectedTable = searchParams.get("table") || (tables?.length > 0 ? tables[0] : null);

  return (
    <>
      {/* <CallWorld /> */}

      <TableSelector value={selectedTable} options={tables} />
      <SQLEditor table={selectedTable} tablesLoading={tablesLoading} setQuery={setQuery} />
      <TablesViewer table={selectedTable} query={query} />
    </>
  );
}
