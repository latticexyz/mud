import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export function useSchemaQuery(table?: string) {
  const { chainName, worldAddress } = useParams();
  return useQuery({
    queryKey: ["schema", chainName, worldAddress, table],
    queryFn: async () => {
      const response = await fetch(`/api/schema?table=${table}`);
      return response.json();
    },
    select: (data) => {
      return data.schema;
    },
    enabled: !!table,
  });
}
