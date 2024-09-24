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

export type TableData = {
  columns: string[];
  rows: Record<string, string>[];
};

export function useTableDataQuery({ deployedTable, query }: Props) {
  const { chainName, worldAddress } = useParams();
  const indexerApiUrl = useIndexerApiUrl();

  return useQuery<DozerResponse, Error, TableData | undefined>({
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
      if (!deployedTable || !data?.result?.[0]) return;

      const schemaKeys = Object.keys(deployedTable.schema);
      const result = data.result[0];
      const columnKeys = result[0].map((columnKey) => {
        const schemaKey = schemaKeys.find((schemaKey) => schemaKey.toLowerCase() === columnKey);
        return schemaKey || columnKey;
      });
      const rows = result.slice(1).map((row) => Object.fromEntries(columnKeys.map((key, index) => [key, row[index]])));

      return {
        columns: columnKeys,
        rows,
      };
    },
    enabled: !!deployedTable && !!query,
    refetchInterval: 2_000,
  });
}
