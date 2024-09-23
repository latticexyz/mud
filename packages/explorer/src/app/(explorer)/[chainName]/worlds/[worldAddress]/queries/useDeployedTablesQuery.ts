import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { internalNamespaces } from "../../../../../../common";
import { DeployedTable } from "../api/utils/decodeTable";
import { useApiTablesUrl } from "./utils/useApiUrl";

export function useDeployedTablesQuery() {
  const { worldAddress, chainName } = useParams();
  const apiTablesUrl = useApiTablesUrl();

  return useQuery({
    queryKey: ["deployedTables", worldAddress, chainName],
    queryFn: async () => {
      const res = await fetch(`${apiTablesUrl}/deployed-tables`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      return data;
    },
    select: (data: { data: DeployedTable[] }) =>
      data.data.sort(({ namespace }) => (internalNamespaces.includes(namespace) ? 1 : -1)),
  });
}
