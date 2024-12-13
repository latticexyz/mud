import { useParams } from "next/navigation";
import { Chain } from "viem";
import { getChain, validateChainName } from "../../../common";

export function useChain(): Chain {
  const { chainName } = useParams();
  validateChainName(chainName);

  return getChain(chainName);
}
