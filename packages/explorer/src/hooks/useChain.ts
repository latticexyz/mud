import { useParams } from "next/navigation";
import { SupportedChainNames, chainNameId, chains } from "../common";

export function useChain() {
  const { chainName } = useParams();

  // TODO: validate chainName TS
  const chainId = chainNameId[chainName as SupportedChainNames];
  if (!chainId) {
    throw new Error(`Invalid chain ID. Supported chains are: ${Object.keys(chains).join(", ")}.`);
  }

  const chain = chains[chainId];
  return chain;
}

export function useChainId() {
  const chain = useChain();
  return chain.id;
}
