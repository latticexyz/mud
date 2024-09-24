import { useParams } from "next/navigation";
import { Hex } from "viem";
import { useQuery } from "@tanstack/react-query";
import { DeployedTable } from "../api/utils/decodeTable";
import { useIndexerApiUrl } from "../hooks/useIndexerApiUrl";
import { DozerResponse } from "../types";

type Props = {
  deployedTable: DeployedTable | undefined;
  query: string | undefined;
};

export function useTableDataQuery({ deployedTable, query }: Props) {
  const { chainName, worldAddress } = useParams();
  const indexerApiUrl = useIndexerApiUrl();

  return useQuery({
    queryKey: ["table", chainName, worldAddress, query],
    queryFn: async () => {
      const response = await fetch(indexerApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            address: worldAddress as Hex,
            query,
          },
        ]),
      });

      return response.json();
    },
    select: (data: DozerResponse) => {
      if (!deployedTable) return [];

      const columns = Object.keys(deployedTable.schema);
      return data?.result?.[0]
        .slice(1)
        .map((row) => Object.fromEntries(columns.map((key, index) => [key, row[index]])));
    },
    enabled: !!deployedTable && !!query,
    refetchInterval: 1000,
  });
}
