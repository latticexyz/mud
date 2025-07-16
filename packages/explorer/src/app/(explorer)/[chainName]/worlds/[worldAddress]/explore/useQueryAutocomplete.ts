import { useParams } from "next/navigation";
import { SQLAutocomplete, SQLDialect } from "sql-autocomplete";
import { Address } from "viem";
import { useMemo } from "react";
import { Table } from "@latticexyz/config";
import { useChain } from "../../../../hooks/useChain";
import { useIndexerForChainId } from "../../../../hooks/useIndexerForChainId";
import { constructTableName } from "../../../../utils/constructTableName";

export function useQueryAutocomplete(table?: Table) {
  const { worldAddress } = useParams<{ worldAddress: Address }>();
  const { id: chainId } = useChain();
  const indexer = useIndexerForChainId(chainId);

  return useMemo(() => {
    if (!table || !worldAddress || !chainId) return null;

    const tableName = constructTableName(table, worldAddress as Address, indexer.type);
    const columnNames = Object.keys(table.schema);

    return new SQLAutocomplete(SQLDialect.PLpgSQL, [tableName], columnNames);
  }, [table, worldAddress, chainId, indexer.type]);
}
