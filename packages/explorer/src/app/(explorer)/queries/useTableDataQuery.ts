import { useParams } from "next/navigation";
import { Parser } from "node-sql-parser";
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

const parser = new Parser();

export type TableData = {
  columns: string[];
  rows: Record<string, string>[];
};

export function useTableDataQuery({ table, query }: Props) {
  const { chainName, worldAddress } = useParams();
  const { id: chainId } = useChain();
  const decodedQuery = decodeURIComponent(query);

  return useQuery<DozerResponse, Error, TableData | undefined>({
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
    select: (data: DozerResponse) => {
      if (!table || !data?.result?.[0]) return;

      const parsedQuery = parser.astify(decodedQuery);
      const columnKeys = parsedQuery.columns.map((column) => column.expr.column);
      const result = data.result[0];
      const rows = result.slice(1).map((row) => Object.fromEntries(columnKeys.map((key, index) => [key, row[index]])));

      return {
        columns: columnKeys,
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
