import { useParams } from "next/navigation";
import { Hex } from "viem";
import { useQuery } from "@tanstack/react-query";
import { DeployedTable } from "../app/(explorer)/[chainName]/worlds/[worldAddress]/explore/utils/decodeTable";
import { getSqliteTableId, useTableDataUrl } from "./useDeployedTablesQuery";

export function useTableDataQuery(deployedTable: DeployedTable | undefined) {
  const { chainName, worldAddress } = useParams();
  const tableId = getSqliteTableId(worldAddress as Hex, deployedTable);
  const tableUrl = useTableDataUrl(deployedTable);

  return useQuery({
    queryKey: ["table", chainName, worldAddress, tableId],
    queryFn: async () => {
      // TODO: add proper URL
      const response = await fetch(tableUrl);
      return response.json();
    },
    select: (data) => {
      return data.data;
    },
    enabled: !!deployedTable,
    refetchInterval: 1000,
  });
}
