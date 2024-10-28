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

export type TDataRow = Record<string, unknown>;
export type TData = {
  columns: string[];
  rows: TDataRow[];
};

export function useTableDataQuery({ table, query }: Props) {
  const { chainName, worldAddress } = useParams();
  const { id: chainId } = useChain();
  const decodedQuery = decodeURIComponent(query ?? "");

  return useQuery<DozerResponse, Error, TData | undefined>({
    queryKey: ["tableData", chainName, worldAddress, decodedQuery],
    queryFn: async () => {
      const indexer = indexerForChainId(chainId);
      const response = await fetch(indexer.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            address: worldAddress as Hex,
            query: decodedQuery,
          },
        ]),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || "Network response was not ok");
      }

      return data;
    },
    select: (data: DozerResponse): TData | undefined => {
      if (!table || !data?.result?.[0]) return undefined;

      const result = data.result[0];
      // if columns are undefined, the result is empty
      if (!result[0]) return undefined;

      const schema = Object.keys(table.schema);
      const columns = result[0]
        ?.map((columnKey) => {
          const schemaKey = schema.find((schemaKey) => schemaKey.toLowerCase() === columnKey);
          return schemaKey || columnKey;
        })
        .filter((key) => schema.includes(key));

      const rows = result.slice(1).map((row) => Object.fromEntries(columns.map((key, index) => [key, row[index]])));
      return {
        columns,
        rows,
      };
    },
    enabled: !!table && !!query,
    refetchInterval: (query) => {
      if (query.state.error) return false;
      return 1000;
    },
  });
}
