import { useParams } from "next/navigation";
import { Hex } from "viem";
import { useQuery } from "@tanstack/react-query";
import { DeployedTable } from "../../app/(explorer)/[chainName]/worlds/[worldAddress]/explore/utils/decodeTable";
import { bufferToBigInt } from "../../app/(explorer)/[chainName]/worlds/[worldAddress]/utils/bufferToBigInt";
import { camelCase } from "../../lib/utils";

type Props = {
  deployedTable: DeployedTable | undefined;
};

function getSqliteTableId(worldAddress: Hex, deployedTable?: DeployedTable) {
  if (!deployedTable) return undefined;
  if (!deployedTable.namespace) return `${worldAddress}__${deployedTable.name}`.toLowerCase();
  return `${worldAddress}__${deployedTable.namespace}__${deployedTable.name}`.toLowerCase();
}

export function useTableDataQuery({ deployedTable }: Props) {
  const { chainName, worldAddress } = useParams();
  const tableId = getSqliteTableId(worldAddress as Hex, deployedTable);

  return useQuery({
    queryKey: ["rows", chainName, worldAddress, tableId],
    queryFn: async () => {
      const response = await fetch(`/api/rows?tableId=${tableId}`);
      return response.json();
    },
    select: (data) => {
      return data.rows.map((row: object) => {
        return Object.fromEntries(
          Object.entries(row).map(([key, value]) => {
            if (value?.type === "Buffer") {
              return [camelCase(key), bufferToBigInt(value?.data)];
            }
            return [camelCase(key), value];
          }),
        );
      });
    },
    enabled: !!deployedTable,
    refetchInterval: 1000,
  });
}
