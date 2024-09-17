import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export function useMUDConfigQuery(table?: string) {
  const { chainName, worldAddress } = useParams();
  return useQuery({
    queryKey: ["mudConfig", chainName, worldAddress, table],
    queryFn: async () => {
      const response = await fetch(`/api/table?table=${table}`);
      return response.json();
    },
    select: (data) => {
      return {
        ...data.table,
        key_schema: JSON.parse(data.table.key_schema).json,
        value_schema: JSON.parse(data.table.value_schema).json,
      };
    },
    enabled: !!table,
  });
}
