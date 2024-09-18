import { useParams } from "next/navigation";
import { Hex } from "viem";
import { useQuery } from "@tanstack/react-query";
import { decodeTable } from "../../app/(explorer)/[chainName]/worlds/[worldAddress]/explore/utils/decodeTable";

type ApiResponse = {
  rows: {
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
    queryKey: ["rows", TABLES_QUERY_TABLE],
    queryFn: async () => {
      const response = await fetch(`/api/rows?tableId=${TABLES_QUERY_TABLE}`);
      return response.json();
    },
    select: (data: ApiResponse) => {
      return data.rows.map((row) => {
        return decodeTable([
          row.table_id,
          row.field_layout,
          row.key_schema,
          row.value_schema,
          row.abi_encoded_key_names,
          row.abi_encoded_field_names,
        ]);
      });
    },
    refetchInterval: 15_000,
  });
}
