import { useParams } from "next/navigation";
import { Hex } from "viem";
import mudConfig from "@latticexyz/store/mud.config";
import { useQuery } from "@tanstack/react-query";
import { DeployedTable } from "../app/(explorer)/[chainName]/worlds/[worldAddress]/explore/utils/decodeTable";
import { internalNamespaces } from "../common";
import { snakeCase } from "../lib/utils";

// import { decodeTable } from "../../app/(explorer)/[chainName]/worlds/[worldAddress]/explore/utils/decodeTable";
// import { internalNamespaces } from "../../common";
// import { useDozerUrl } from "../../hooks/useDozerUrl";

export function getSqliteTableId(worldAddress: Hex, deployedTable?: DeployedTable) {
  if (!deployedTable) return undefined;
  const sqliteTableName = snakeCase(deployedTable.name);

  if (!deployedTable.namespace) return `${worldAddress}_${sqliteTableName}`.toLowerCase();
  return `${worldAddress}__${deployedTable.namespace}_${sqliteTableName}`.toLowerCase();
}

// TODO: improve
export function useTableDataUrl(table: DeployedTable | undefined) {
  const { worldAddress, chainName } = useParams();
  const tableId = chainName === "anvil" ? getSqliteTableId(worldAddress as Hex, table as never) : table?.tableId;
  const indexerType = chainName === "anvil" ? "sqlite-indexer" : "dozer";

  if (!table) return undefined;
  return `/api/table/${indexerType}?tableId=${tableId}`;
}

export function useDeployedTablesQuery() {
  const { worldAddress, chainName } = useParams();
  // TODO: improve naming + ts
  const fetchUrl = useTableDataUrl(mudConfig.tables.store__Tables);

  return useQuery({
    queryKey: ["deployedTables", worldAddress, chainName],
    queryFn: async () => {
      const response = await fetch(fetchUrl);
      return response.json();
    },

    select: (data) => {
      // TODO: ts
      return data.data.sort(({ namespace }) => (internalNamespaces.includes(namespace) ? 1 : -1));
    },
  });
}
