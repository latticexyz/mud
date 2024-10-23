import { useParams } from "next/navigation";
import { AST, Parser } from "node-sql-parser";
import { Hex } from "viem";
import { Table } from "@latticexyz/config";
import { useQuery } from "@tanstack/react-query";
import { useChain } from "../hooks/useChain";
import { DozerResponse } from "../types";
import { indexerForChainId } from "../utils/indexerForChainId";

const parser = new Parser();

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

  return useQuery<DozerResponse, Error, TableData | undefined>({
    queryKey: ["tableData", chainName, worldAddress, query],
    queryFn: async () => {
      const indexer = indexerForChainId(chainId);
      const ast = parser.astify(query ?? "") as AST;
      let formattedQuery = parser.sqlify(ast, {
        database: "Postgresql",
        parseOptions: {
          includeLocations: false,
        },
      });

      // remove double quotes from table names, required for Dozer
      if ("from" in ast && Array.isArray(ast.from)) {
        for (const tableInfo of ast.from) {
          if ("table" in tableInfo) {
            formattedQuery = formattedQuery.replace(new RegExp(`"${tableInfo.table}"`, "g"), tableInfo.table);
          }
        }
      }

      const response = await fetch(indexer.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            address: worldAddress as Hex,
            query: formattedQuery,
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
    enabled: !!table && !!query,
    refetchInterval: (query) => {
      if (query.state.error) return false;
      return 1000;
    },
  });
}
