import { useParams } from "next/navigation";
import { namedChains } from "../common";

export function useChainId() {
  const params = useParams();
  const { chainName } = params;
  return namedChains[chainName]; // TODO: TS
}
