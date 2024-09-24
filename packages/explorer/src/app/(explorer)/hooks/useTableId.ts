import { useParams } from "next/navigation";
import { anvil } from "viem/chains";
import { supportedChains, validateChainName } from "../../../common";
import { DeployedTable } from "../app/(explorer)/[chainName]/worlds/[worldAddress]/api/utils/decodeTable";
import { snakeCase } from "../lib/utils";

export function useTableId(deployedTable?: DeployedTable) {
  const { chainName, worldAddress } = useParams();
  if (!deployedTable) return undefined;

  validateChainName(chainName);
  const chainId = supportedChains[chainName].id;

  let tableId = deployedTable.name;
  if (deployedTable.namespace) {
    tableId = `${deployedTable.namespace}${chainId === anvil.id ? "_" : "__"}${tableId}`;
  }

  return chainId === anvil.id ? `${worldAddress}__${snakeCase(tableId)}`.toLowerCase() : tableId;
}
