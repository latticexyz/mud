import { useParams } from "next/navigation";
import { anvil } from "viem/chains";
import { supportedChains, validateChainName } from "../common";

export function useApiBaseUrl() {
  const { chainName, worldAddress } = useParams();
  return `/${chainName}/worlds/${worldAddress}/api`;
}

export function useApiTablesUrl() {
  const apiBaseUrl = useApiBaseUrl();
  const { chainName } = useParams();
  validateChainName(chainName);

  const chainId = supportedChains[chainName].id;
  if (chainId === anvil.id) {
    return `${apiBaseUrl}/sqlite-indexer`;
  }
  return `${apiBaseUrl}/dozer`;
}
