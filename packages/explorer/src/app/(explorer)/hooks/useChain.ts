import { useParams } from "next/navigation";
import { Chain } from "viem";
import { supportedChains, validateChainName } from "../../../common";

export function useChain(): Chain {
  const { chainName } = useParams();
  validateChainName(chainName);

  const chain = supportedChains[chainName];
  return chain;
}
