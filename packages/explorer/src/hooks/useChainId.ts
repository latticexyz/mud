import { useParams } from "next/navigation";
import { namedChains } from "../common";

export function useChainId() {
  const params = useParams();
  const { chainName } = params;
  const chain = namedChains[chainName]; // TODO: make a getter?

  return chain.id; // TODO: TS
}
