import { useParams } from "next/navigation";
import { Parser } from "node-sql-parser";
import { parseAsInteger, useQueryState } from "nuqs";
import { Hex, stringify } from "viem";
import { Table } from "@latticexyz/config";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useChain } from "../hooks/useChain";
import { DozerResponse } from "../types";
import { indexerForChainId } from "../utils/indexerForChainId";

type Props = {
  table: Table | undefined;
  query: string | undefined;
  isLiveQuery: boolean;
};

export type TDataRow = Record<string, unknown>;
export type TData = {
  columns: string[];
  rows: TDataRow[];
  queryDuration: number;
};

const sqlParser = new Parser();

export function useTableDataQuery({ table, query, isLiveQuery }: Props) {
  const { chainName, worldAddress } = useParams();
  const { id: chainId } = useChain();
  const decodedQuery = decodeURIComponent(query ?? "");
  const [page] = useQueryState("page", parseAsInteger.withDefault(0));
  const [pageSize] = useQueryState("pageSize", parseAsInteger.withDefault(5));

  return useQuery<DozerResponse & { queryDuration: number }, Error, TData | undefined>({
    queryKey: ["tableData", chainName, worldAddress, decodedQuery, page, pageSize],
    queryFn: async () => {
      const startTime = performance.now();
      const indexer = indexerForChainId(chainId);
      const offset = page * pageSize;
      const limit = pageSize;
      let ast = sqlParser.astify(decodedQuery);

      if (Array.isArray(ast) && ast.length > 0 && typeof ast[0] === "object") {
        ast = ast[0];
      }

      let formattedQuery = decodedQuery.endsWith(";") ? decodedQuery.slice(0, -1) : decodedQuery;
      if (!("limit" in ast) || !ast.limit) {
        formattedQuery = `${formattedQuery} LIMIT ${limit}`;
      }
      if (!("limit" in ast) || !ast.limit || ast.limit?.seperator === "") {
        formattedQuery = `${formattedQuery} OFFSET ${offset}`;
      }

      const response = await fetch(indexer.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: stringify([
          {
            address: worldAddress as Hex,
            query: formattedQuery,
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

      const indexer = indexerForChainId(chainId);
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
    placeholderData: keepPreviousData,
    retry: false,
    enabled: !!table && !!query,
    refetchInterval: (query) => {
      if (query.state.error) return false;
      else if (!isLiveQuery) return false;
      return 1000;
    },
  });
}
