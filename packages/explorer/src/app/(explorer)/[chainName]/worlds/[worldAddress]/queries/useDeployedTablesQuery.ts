import { useParams } from "next/navigation";
import { Hex } from "viem";
import mudConfig from "@latticexyz/store/mud.config";
import { useQuery } from "@tanstack/react-query";
import { internalNamespaces } from "../../../../../../common";
import { useApiTablesUrl } from "../../../../../../hooks/useApiUrl";
import { useDozerUrl } from "../../../../../../hooks/useDozerUrl";
import { DeployedTable, decodeTable } from "../api/utils/decodeTable";
import { fetchDozer } from "../api/utils/fetchDozer";

type DozerResponse = {
  block_height: number;
  result: [string[][]];
};

export function useDeployedTablesQuery() {
  const dozerUrl = useDozerUrl();
  const { worldAddress, chainName } = useParams();

  return useQuery({
    queryKey: ["deployedTables", worldAddress, chainName],
    queryFn: async () => {
      const storeTablesKey = "store__Tables";
      const response = await fetch(dozerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            address: worldAddress as Hex,
            query: `SELECT ${Object.keys(mudConfig.tables[storeTablesKey].schema).join(", ")} FROM ${storeTablesKey}`,
          },
        ]),
      });
      return response.json();
    },
    select: (data: DozerResponse) => {
      return data.result[0]
        .slice(1)
        .map((row: string[]) => {
          return decodeTable({
            tableId: row[0],
            keySchema: row[2],
            valueSchema: row[3],
            abiEncodedKeyNames: row[4],
            abiEncodedFieldNames: row[5],
          });
        })
        .sort(({ namespace }) => (internalNamespaces.includes(namespace) ? 1 : -1));
    },
  });
}
