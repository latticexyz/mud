import { useParams } from "next/navigation";
import { Hex } from "viem";
import { Table } from "@latticexyz/config";
import { useQuery } from "@tanstack/react-query";
import { useChain } from "../hooks/useChain";
import { DozerResponse } from "../types";
import { indexerForChainId } from "../utils/indexerForChainId";

export type TDataRow = Record<string, unknown>;
export type TData = {
  columns: string[];
  rows: TDataRow[];
};

export function useCrosschainRecordsQuery(viewedTable: Table | undefined) {
  const { chainName, worldAddress } = useParams();
  const { id: chainId } = useChain();

  const tableName = "crosschain__crosschain_record";
  const decodedQuery = `SELECT * FROM "${worldAddress}__${tableName}"`;
  const table = {
    tableId: "0x746263726f7373636861696e0000000043726f7373636861696e5265636f7264",
    name: "CrosschainRecord",
    namespace: "crosschain",
    label: "CrosschainRecord",
    namespaceLabel: "crosschain",
    type: "table",
    schema: {
      tableId: { type: "bytes32", internalType: "bytes32" },
      keyHash: { type: "bytes32", internalType: "bytes32" },
      blockNumber: { type: "uint256", internalType: "uint256" },
      timestamp: { type: "uint256", internalType: "uint256" },
      owned: { type: "bool", internalType: "bool" },
    },
    key: ["tableId", "keyHash"],
  } as const;

  return useQuery<DozerResponse, Error, TData | undefined>({
    queryKey: ["crosschainRecords", chainName, worldAddress, decodedQuery],
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
      if (!data?.result?.[0]) return undefined;

      const indexer = indexerForChainId(chainId);
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

      const rows = result
        .slice(1)
        .map((row) =>
          Object.fromEntries(
            columns.map((key, index) => {
              const value = row[index];
              const type = table.schema[key as keyof typeof table.schema];
              if (type?.type === "bool") {
                return [key, indexer.type === "sqlite" ? value === "1" : value];
              }
              return [key, value];
            }),
          ),
        )
        .filter((row) => row.tableId === viewedTable?.tableId);

      return {
        columns,
        rows,
      };
    },
    refetchInterval: (query) => {
      if (query.state.error) return false;
      return 500;
    },
  });
}
