import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export function useTablesQuery() {
  const { chainName, worldAddress } = useParams();
  return useQuery({
    queryKey: ["tables", chainName, worldAddress],
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
}
