import { useParams } from "next/navigation";
import { chainNameId, chains, isValidChainName } from "../common";

export function useChain() {
  const { chainName } = useParams();
  if (!isValidChainName(chainName)) {
    throw new Error(`Invalid chain name. Supported chains are: ${Object.keys(chainNameId).join(", ")}.`);
  }

  const chainId = chainNameId[chainName];
  const chain = chains[chainId];
  return chain;
}

export function useChainId() {
  const chain = useChain();
  return chain.id;
}
