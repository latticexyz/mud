import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { bufferToBigInt } from "../../app/[chainName]/(explorer)/worlds/[worldAddress]/utils/bufferToBigInt";

export function useRowsQuery(table?: string) {
  const { chainName, worldAddress } = useParams();
  return useQuery({
    queryKey: ["rows", chainName, worldAddress, table],
    queryFn: async () => {
      // TODO: use query as param
      const response = await fetch(`/api/rows?table=${table}`);
      return response.json();
    },
    select: (data) => {
      return data.rows.map((row: object) => {
        return Object.fromEntries(
          Object.entries(row).map(([key, value]) => {
            if (value?.type === "Buffer") {
              return [key, bufferToBigInt(value?.data)];
            }
            return [key, value];
          }),
        );
      });
    },
    enabled: !!table,
    refetchInterval: 1000,
  });
}
