"use client";

import { Loader } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { TableSelector } from "./TableSelector";
import { TablesViewer } from "./TablesViewer";

export function DataExplorer() {
  const { data: tables, isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await fetch("/api/tables");
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error);
      }
      return json;
    },
    select: (data) => data.tables.map((table: { name: string }) => table.name),
    refetchInterval: 15000,
    throwOnError: true,
    retry: false,
  });

  if (isLoading) {
    return <Loader className="animate-spin" />;
  }

  return (
    <>
      <TableSelector tables={tables} />
      <TablesViewer />
    </>
  );
}
