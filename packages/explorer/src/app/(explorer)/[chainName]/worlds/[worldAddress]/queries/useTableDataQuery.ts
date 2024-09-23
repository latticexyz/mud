import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useApiTablesUrl } from "../../../../../../hooks/useApiUrl";
import { useTableId } from "../../../../../../hooks/useTableId";
import { DeployedTable } from "../api/utils/decodeTable";

type Props = {
  deployedTable: DeployedTable | undefined;
  query: string | undefined;
};

export function useTableDataQuery({ deployedTable, query }: Props) {
  const { chainName, worldAddress } = useParams();
  const tableId = useTableId(deployedTable);
  const apiTablesUrl = useApiTablesUrl();

  return useQuery({
    queryKey: ["table", chainName, worldAddress, tableId, query],
    queryFn: async () => {
      if (!tableId || !deployedTable || !query) {
        throw new Error("Table name and query are required");
      }

      const columnNames = Object.keys(deployedTable.schema).join(",");
      const params = new URLSearchParams({ tableId, query, columnNames });
      const res = await fetch(`${apiTablesUrl}/table?${params.toString()}`);
      const data = await res.json();

      return data;
    },
    select: (data) => data.data,
    enabled: !!deployedTable && !!query,
    refetchInterval: 1000,
  });
}
