import { useParams } from "next/navigation";
import { supportedChains, validateChainName } from "../common";

export function useChain() {
  const { chainName } = useParams();
  validateChainName(chainName);

  const chain = supportedChains[chainName];
  return chain;
}
