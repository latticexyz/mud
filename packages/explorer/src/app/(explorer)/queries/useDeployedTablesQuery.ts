import { useParams } from "next/navigation";
import { Hex } from "viem";
import { anvil } from "viem/chains";
import mudConfig from "@latticexyz/store/mud.config";
import { useQuery } from "@tanstack/react-query";
import { internalNamespaces } from "../../../common";
import { decodeTable } from "../api/utils/decodeTable";
import { useChain } from "../hooks/useChain";
import { useIndexerApiUrl } from "../hooks/useIndexerApiUrl";
import { DozerResponse } from "../types";

export function useDeployedTablesQuery() {
  const { worldAddress, chainName } = useParams();
  const { id: chainId } = useChain();
  const indexerApiUrl = useIndexerApiUrl();

  return useQuery({
    queryKey: ["deployedTables", worldAddress, chainName],
    queryFn: async () => {
      const storeTablesKey = "store__Tables";
      const tableName = chainId === anvil.id ? `${worldAddress}__${storeTablesKey}` : storeTablesKey;
      const columns = chainId === anvil.id ? "*" : Object.keys(mudConfig.tables[storeTablesKey].schema).join(", ");
      const query = `SELECT ${columns} FROM "${tableName}"`;

      const response = await fetch(indexerApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            address: worldAddress as Hex,
            query,
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
