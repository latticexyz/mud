import { useParams } from "next/navigation";
import { Hex } from "viem";
import { Table } from "@latticexyz/config";
import { useQuery } from "@tanstack/react-query";
import { useChain } from "../hooks/useChain";
import { DozerResponse } from "../types";
import { indexerForChainId } from "../utils/indexerForChainId";

type Props = {
  table: Table | undefined;
  query: string | undefined;
};

export type TableData = {
  columns: string[];
  rows: Record<string, string>[];
};

export function useTableDataQuery({ table, query }: Props) {
  const { chainName, worldAddress } = useParams();
  const { id: chainId } = useChain();
  const indexer = indexerForChainId(chainId);

  return useQuery<DozerResponse, Error, TableData | undefined>({
    queryKey: ["tableData", chainName, worldAddress, query],
    queryFn: async () => {
      if (!indexer.url) return;
      const response = await fetch(indexer.url, {
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
      if (!table || !data?.result?.[0]) return;

      const schemaKeys = Object.keys(table.schema);
      const result = data.result[0];
      const columnKeys = result[0]
        .map((columnKey) => {
          const schemaKey = schemaKeys.find((schemaKey) => schemaKey.toLowerCase() === columnKey);
          return schemaKey || columnKey;
        })
        .filter((key) => schemaKeys.includes(key));
      const rows = result.slice(1).map((row) => Object.fromEntries(columnKeys.map((key, index) => [key, row[index]])));

      return {
        columns: columnKeys,
        rows,
      };
    },
    enabled: !!table && !!query && !!indexer.url,
    refetchInterval: 1_000,
  });
}
