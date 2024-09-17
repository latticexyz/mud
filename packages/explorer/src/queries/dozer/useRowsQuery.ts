import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDozerUrl } from "../../hooks/useDozerUrl";
import { Table } from "./useTablesQuery";

type Schema = Table["keySchema"] & Table["valueSchema"];

type DozerResponse = {
  block_height: number;
  result: [string[][]];
};

export function useRowsQuery(schema: Schema, query?: string) {
  const { worldAddress, chainName } = useParams();
  const dozerUrl = useDozerUrl();

  return useQuery({
    queryKey: ["rows", worldAddress, chainName, query],
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
    select: (data: DozerResponse) => {
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
    enabled: !!query,
  });
}
