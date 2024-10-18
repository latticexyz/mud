import { useParams } from "next/navigation";
import { SQLAutocomplete, SQLDialect } from "sql-autocomplete";
import { Address } from "viem";
import { useMemo } from "react";
import { Table } from "@latticexyz/config";
import { useChain } from "../../../../hooks/useChain";
import { constructTableName } from "../../../../utils/constructTableName";

export function useQueryAutocomplete(table?: Table) {
  const { id: chainId } = useChain();
  const { worldAddress } = useParams<{ worldAddress: Address }>();

  return useMemo(() => {
    if (!table || !worldAddress || !chainId) return null;

    const tableName = constructTableName(table, worldAddress as Address, chainId);
    const columnNames = Object.keys(table.schema);

    return new SQLAutocomplete(SQLDialect.PLpgSQL, [tableName], columnNames);
  }, [table, worldAddress, chainId]);
}
