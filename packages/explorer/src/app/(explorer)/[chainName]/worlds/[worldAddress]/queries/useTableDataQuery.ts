import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DeployedTable } from "../api/utils/decodeTable";
import { useApiTablesUrl } from "./utils/useApiUrl";
import { useTableName } from "./utils/useTableName";

export function useTableDataQuery(deployedTable: DeployedTable | undefined) {
  const { chainName, worldAddress } = useParams();
  const tableId = useTableName(deployedTable);
  const apiTablesUrl = useApiTablesUrl();

  return useQuery({
    queryKey: ["table", chainName, worldAddress, tableId],
    queryFn: async () => {
      const columns = deployedTable?.schema ? Object.keys(deployedTable.schema).join(",") : "";
      if (!tableId || !columns) {
        throw new Error("Table ID and columns are required");
      }

      const params = new URLSearchParams({ tableId, columns });
      const res = await fetch(`${apiTablesUrl}/table?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      return data;
    },
    select: (data) => data.data,
    enabled: !!deployedTable,
    refetchInterval: 1000,
  });
}
