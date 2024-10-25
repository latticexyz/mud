import { useParams } from "next/navigation";
import { Hex } from "viem";
import { isDefined } from "@latticexyz/common/utils";
import { Table } from "@latticexyz/config";
import mudConfig from "@latticexyz/store/mud.config";
import { useQuery } from "@tanstack/react-query";
import { internalNamespaces } from "../../../common";
import { decodeTable } from "../api/utils/decodeTable";
import { useChain } from "../hooks/useChain";
import { DozerResponse } from "../types";
import { indexerForChainId } from "../utils/indexerForChainId";

export function useTablesQuery() {
  const { worldAddress, chainName } = useParams();
  const { id: chainId } = useChain();

  return useQuery<DozerResponse, Error, Table[]>({
    queryKey: ["tables", worldAddress, chainName],
    queryFn: async () => {
      const indexer = indexerForChainId(chainId);
      const tableName = "store__Tables";
      const query =
        indexer.type === "sqlite"
          ? `SELECT * FROM "${worldAddress}__${tableName}"`
          : `SELECT ${Object.keys(mudConfig.tables[tableName].schema).join(", ")} FROM ${tableName}`;

      const response = await fetch(indexer.url, {
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
          if (!row[0] || !row[2] || !row[3] || !row[4] || !row[5]) return undefined;
          return decodeTable({
            tableId: row[0],
            keySchema: row[2],
            valueSchema: row[3],
            abiEncodedKeyNames: row[4],
            abiEncodedFieldNames: row[5],
          });
        })
        .filter(isDefined)
        .sort(({ namespace }) => (internalNamespaces.includes(namespace) ? 1 : -1));
    },
    refetchInterval: 5000,
  });
}
