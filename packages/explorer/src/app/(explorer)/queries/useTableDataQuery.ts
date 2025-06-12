import { useParams } from "next/navigation";
import { Hex, stringify } from "viem";
import { Table } from "@latticexyz/config";
import { useQuery } from "@tanstack/react-query";
import { useSQLQueryState } from "../[chainName]/worlds/[worldAddress]/explore/hooks/useSQLQueryState";
import { useChain } from "../hooks/useChain";
import { useIndexerForChainId } from "../hooks/useIndexerForChainId";
import { DozerResponse } from "../types";

type Props = {
  table: Table | undefined;
  isLiveQuery: boolean;
};

export type TDataRow = Record<string, unknown>;
export type TData = {
  columns: string[];
  rows: TDataRow[];
  queryDuration: number;
};

export function useTableDataQuery({ table, isLiveQuery }: Props) {
  const { chainName, worldAddress } = useParams();
  const { id: chainId } = useChain();
  const [query] = useSQLQueryState();
  const indexer = useIndexerForChainId(chainId);

  return useQuery<DozerResponse & { queryDuration: number }, Error, TData | undefined>({
    queryKey: ["tableData", chainName, worldAddress, query],
    queryFn: async () => {
      const startTime = performance.now();
      const response = await fetch(indexer.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: stringify([
          {
            address: worldAddress as Hex,
            query,
          },
        ]),
      });

      const data = await response.json();
      const queryDuration = performance.now() - startTime;

      if (!response.ok) {
        throw new Error(data.msg || "Network response was not ok");
      }

      return { ...data, queryDuration };
    },
    select: (data: DozerResponse & { queryDuration: number }): TData | undefined => {
      if (!table || !data?.result?.[0]) return undefined;

      const result = data.result[0];
      // if columns are undefined, the result is empty
      if (!result[0]) return undefined;

      const schema = Object.keys(table.schema);
      const columns = result[0]?.map((columnKey) => {
        const schemaKey = schema.find((schemaKey) => schemaKey.toLowerCase() === columnKey);
        return schemaKey || columnKey;
      });

      const rows = result.slice(1).map((row) =>
        Object.fromEntries(
          columns.map((key, index) => {
            const value = row[index];
            const type = table?.schema[key];
            if (type?.type === "bool") {
              return [key, indexer.type === "sqlite" ? value === "1" : value];
            }
            return [key, value];
          }),
        ),
      );
      return {
        columns,
        rows,
        queryDuration: data.queryDuration,
      };
    },
    retry: false,
    enabled: !!table && !!query,
    refetchInterval: (query) => {
      if (query.state.error) return false;
      else if (!isLiveQuery) return false;
      return 1000;
    },
  });
}
