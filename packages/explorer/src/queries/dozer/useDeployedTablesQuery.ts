import { useParams } from "next/navigation";
import { Hex } from "viem";
import { fetchRecords, selectFrom } from "@latticexyz/store-sync/internal";
import mudConfig from "@latticexyz/store/mud.config";
import { useQuery } from "@tanstack/react-query";
import { decodeTable } from "../../app/(explorer)/[chainName]/worlds/[worldAddress]/explore/utils/decodeTable";
import { internalNamespaces } from "../../common";
import { useDozerUrl } from "../../hooks/useDozerUrl";

export function useDeployedTablesQuery() {
  const { worldAddress, chainName } = useParams();
  const dozerUrl = useDozerUrl();

  return useQuery({
    queryKey: ["deployedTables", worldAddress, chainName],
    queryFn: () => {
      return fetchRecords({
        indexerUrl: dozerUrl,
        storeAddress: worldAddress as Hex,
        queries: [
          selectFrom({
            table: mudConfig.tables.store__Tables,
          }),
        ],
      });
    },
    select: (data) => {
      return data.result[0].records
        .map((row) => decodeTable(row))
        .sort(({ namespace }) => (internalNamespaces.includes(namespace) ? 1 : -1));
    },
  });
}
