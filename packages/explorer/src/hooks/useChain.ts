import { useParams } from "next/navigation";
import { chainNameId, chains, isValidChainName } from "../common";

export function useChain() {
  const { chainName } = useParams();
  isValidChainName(chainName);

  const chainId = chainNameId[chainName];
  const chain = chains[chainId];
  return chain;
}

export function useChainId() {
  const chain = useChain();
  return chain.id;
}
