"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SQLEditor } from "./SQLEditor";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";

export default function DataExplorer() {
  const [selectedTable, setSelectedTable] = useState<string | undefined>();
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

  // Fetch tables, and select the first table if none is selected
  useEffect(() => {
    if (!selectedTable && tables) {
      setSelectedTable(tables[0]);
    }
  }, [selectedTable, tables]);

  return (
    <>
      <h1 className="text-4xl font-bold py-4">Data explorer</h1>
      <div className="w-full">
        <TableSelector value={selectedTable} onChange={setSelectedTable} options={tables} />
        <SQLEditor table={selectedTable} tablesLoading={tablesLoading} setQuery={setQuery} />
        <TablesViewer table={selectedTable} query={query} />
      </div>
    </>
  );
}
