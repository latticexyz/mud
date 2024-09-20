import { useParams } from "next/navigation";
import { Hex } from "viem";
import { useQuery } from "@tanstack/react-query";
import { decodeTable } from "../../app/(explorer)/[chainName]/worlds/[worldAddress]/explore/utils/decodeTable";
import { internalNamespaces } from "../../common";

type ApiResponse = {
  table: {
    table_id: Hex;
    field_layout: Hex;
    key_schema: Hex;
    value_schema: Hex;
    abi_encoded_key_names: Hex;
    abi_encoded_field_names: Hex;
  }[];
};

export function useDeployedTablesQuery() {
  const { worldAddress } = useParams();
  const TABLES_QUERY_TABLE = `${worldAddress}__store__tables`;

  return useQuery({
    queryKey: ["deployedTables", TABLES_QUERY_TABLE],
    queryFn: async () => {
      const response = await fetch(`/api/table?tableId=${TABLES_QUERY_TABLE}`);
      return response.json();
    },
    select: (data: ApiResponse) => {
      return data.table
        .map((row) => {
          return decodeTable({
            tableId: row.table_id,
            fieldLayout: row.field_layout,
            keySchema: row.key_schema,
            valueSchema: row.value_schema,
            abiEncodedKeyNames: row.abi_encoded_key_names,
            abiEncodedFieldNames: row.abi_encoded_field_names,
          });
        })
        .sort(({ namespace }) => (internalNamespaces.includes(namespace) ? 1 : -1));
    },
    refetchInterval: 15_000,
  });
}
