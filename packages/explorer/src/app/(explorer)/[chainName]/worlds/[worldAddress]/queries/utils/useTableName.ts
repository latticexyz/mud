import { useParams } from "next/navigation";
import { anvil } from "viem/chains";
import { supportedChains, validateChainName } from "../../../../../../../common";
import { snakeCase } from "../../../../../../../lib/utils";
import { DeployedTable } from "../../api/utils/decodeTable";

export function useTableName(deployedTable?: DeployedTable) {
  const { chainName, worldAddress } = useParams();
  validateChainName(chainName);
  if (!deployedTable) return undefined;

  const chainId = supportedChains[chainName].id;
  let tableName = deployedTable.name;
  if (chainId === anvil.id) {
    if (deployedTable.namespace) {
      tableName = `${deployedTable.namespace}_${tableName}`;
    }
    return `${worldAddress}__${snakeCase(tableName)}`.toLowerCase();
  } else {
    if (deployedTable.namespace) {
      tableName = `${deployedTable.namespace}__${tableName}`;
    }
    return tableName;
  }
}
