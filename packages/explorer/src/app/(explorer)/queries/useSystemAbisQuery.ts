import { useParams } from "next/navigation";
import { Hex } from "viem";
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import { useQuery } from "@tanstack/react-query";
import { SystemAbisResponse } from "../api/system-abis/route";
import { useChain } from "../hooks/useChain";
import { useTableDataQuery } from "./useTableDataQuery";

const metadataTable = metadataConfig.tables.metadata__ResourceTag;

export function useSystemAbisQuery() {
  const { worldAddress, chainName } = useParams();
  const { id: chainId } = useChain();
  const {
    data: metadata,
    isFetched: isMetadataFetched,
    error: metadataError,
  } = useTableDataQuery({
    table: metadataTable,
    query: `SELECT resource FROM "${metadataTable.namespace}__${metadataTable.name}"`,
    isLiveQuery: false,
  });

  return useQuery<SystemAbisResponse, Error, SystemAbisResponse["abis"]>({
    queryKey: ["systemAbis", worldAddress, chainName],
    queryFn: async () => {
      const uniqueSystemIds = new Set(metadata?.rows.map((row) => row.resource));
      const systemIds = Array.from(uniqueSystemIds).join(",");
      const res = await fetch(
        `/api/system-abis?${new URLSearchParams({ chainId: chainId.toString(), worldAddress: worldAddress as Hex, systemIds })}`,
      );
      const data = await res.json();
      return data;
    },
    select: (data) => data.abis,
    retry: false,
    enabled: isMetadataFetched && !metadataError && Boolean(metadata?.rows?.length),
  });
}
