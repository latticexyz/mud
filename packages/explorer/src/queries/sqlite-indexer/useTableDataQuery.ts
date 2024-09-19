import { useParams } from "next/navigation";
import { Hex } from "viem";
import { useQuery } from "@tanstack/react-query";
import { DeployedTable } from "../../app/(explorer)/[chainName]/worlds/[worldAddress]/explore/utils/decodeTable";
import { bufferToBigInt } from "../../app/(explorer)/[chainName]/worlds/[worldAddress]/utils/bufferToBigInt";
import { camelCase, snakeCase } from "../../lib/utils";

type Props = {
  deployedTable: DeployedTable | undefined;
};

function getSqliteTableId(worldAddress: Hex, deployedTable?: DeployedTable) {
  if (!deployedTable) return undefined;
  const sqliteTableName = snakeCase(deployedTable.name);

  if (!deployedTable.namespace) return `${worldAddress}_${sqliteTableName}`.toLowerCase();
  return `${worldAddress}__${deployedTable.namespace}_${sqliteTableName}`.toLowerCase();
}

export function useTableDataQuery({ deployedTable }: Props) {
  const { chainName, worldAddress } = useParams();
  const tableId = getSqliteTableId(worldAddress as Hex, deployedTable);

  return useQuery({
    queryKey: ["table", chainName, worldAddress, tableId],
    queryFn: async () => {
      const response = await fetch(`/api/table?tableId=${tableId}`);
      return response.json();
    },
    select: (data) => {
      return data.table.map((row: object) => {
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
