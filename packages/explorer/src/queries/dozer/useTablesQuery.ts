import { useParams } from "next/navigation";
import { Hex } from "viem";
import { SchemaAbiType } from "@latticexyz/schema-type/internal";
import { useQuery } from "@tanstack/react-query";
import { decodeTable } from "../../app/(explorer)/[chainName]/worlds/[worldAddress]/explore/decodeTable";
import { useDozerUrl } from "../../hooks/useDozerUrl";

export type DozerResponse = {
  block_height: number;
  result: [Hex[][]];
};

export type TableType = "offchainTable" | "table" | "namespace" | "system";

export type Table = {
  name: string;
  namespace: string;
  schema: Record<string, SchemaAbiType>;
  keySchema: Record<string, SchemaAbiType>;
  valueSchema: Record<string, SchemaAbiType>;
  tableId: Hex;
  type: TableType;
};

const columns = ["tableId", "fieldLayout", "keySchema", "valueSchema", "abiEncodedKeyNames", "abiEncodedFieldNames"];

// TODO: name tables query better
export function useTablesQuery() {
  const { worldAddress, chainName } = useParams();
  const dozerUrl = useDozerUrl();

  return useQuery({
    queryKey: ["tables", worldAddress, chainName],
    queryFn: async () => {
      const response = await fetch(dozerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ address: worldAddress, query: `select ${columns.join(", ")} from store__Tables` }]),
      });
      return response.json();
    },
    select: (data: DozerResponse) => {
      const tables = data.result[0].slice(1).map((row) => {
        const decodedTable = decodeTable(row);
        const table = {
          tableId: decodedTable.tableId,
          name: decodedTable.name,
          namespace: decodedTable.namespace,
          type: decodedTable.type,
          valueSchema: Object.fromEntries(
            Object.entries(decodedTable.valueSchema).map(([key, value]) => [key, value.type as SchemaAbiType]),
          ),
          keySchema: Object.fromEntries(
            Object.entries(decodedTable.keySchema).map(([key, value]) => [key, value.type as SchemaAbiType]),
          ),
        };

        return {
          ...table,
          schema: {
            ...table.keySchema,
            ...table.valueSchema,
          },
        };
      });

      return tables;
    },
  });
}
