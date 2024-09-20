import { useParams } from "next/navigation";
import { Hex } from "viem";
import { fetchRecords, selectFrom } from "@latticexyz/store-sync/internal";
import { useQuery } from "@tanstack/react-query";
import { DeployedTable } from "../../app/(explorer)/[chainName]/worlds/[worldAddress]/explore/utils/decodeTable";
import { useDozerUrl } from "../../hooks/useDozerUrl";

type Props = {
  deployedTable?: DeployedTable;
  query?: string;
};

export function useTableDataQuery({ deployedTable, query }: Props) {
  const { worldAddress, chainName } = useParams();
  const dozerUrl = useDozerUrl();

  return useQuery({
    queryKey: ["table", worldAddress, chainName, query],
    queryFn: () => {
      return fetchRecords({
        indexerUrl: dozerUrl,
        storeAddress: worldAddress as Hex,
        queries: [
          selectFrom({
            table: deployedTable!,
          }),
        ],
      });
    },
    select: (data) => data.result[0].records,
    enabled: !!deployedTable,
  });
}
