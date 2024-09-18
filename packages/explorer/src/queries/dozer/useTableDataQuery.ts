import { useParams } from "next/navigation";
import { Schema } from "@latticexyz/config";
import { useQuery } from "@tanstack/react-query";
import { useDozerUrl } from "../../hooks/useDozerUrl";

type DozerResponse = {
  block_height: number;
  result: [string[][]];
};

type Props = {
  schema?: Schema;
  query?: string;
};

export function useTableDataQuery({ schema, query }: Props) {
  const { worldAddress, chainName } = useParams();
  const dozerUrl = useDozerUrl();

  return useQuery({
    queryKey: ["tableData", worldAddress, chainName, query],
    queryFn: async () => {
      const response = await fetch(dozerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ address: worldAddress, query }]),
      });
      return response.json();
    },
    initialData: {
      block_height: 0,
      result: [[]],
    },
    select: (data: DozerResponse) => {
      if (!data || !schema) return { rows: [], columns: [] };

      const result = data.result[0];
      const columns = result[0];
      const schemaKeys = Object.keys(schema);
      const rows = data.result[0]
        .slice(1)
        .map((row) => Object.fromEntries(schemaKeys.map((key, index) => [key, row[index]])));

      return {
        rows,
        columns,
      };
    },
    enabled: !!query && !!schema,
  });
}
