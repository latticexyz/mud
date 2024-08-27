"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";

export function DataExplorer() {
  const searchParams = useSearchParams();
  const { data: tables } = useQuery({
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
      <TableSelector value={selectedTable} options={tables} />
      <TablesViewer table={selectedTable} />
    </>
  );
}
