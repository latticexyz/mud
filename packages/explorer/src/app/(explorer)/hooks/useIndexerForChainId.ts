import { anvil } from "viem/chains";
import { MUDChain } from "@latticexyz/common/chains";
import { chainIdToName, supportedChains, validateChainId } from "../../../common";
import { useEnv } from "../providers/EnvProvider";

export function useIndexerForChainId(chainId: number) {
  validateChainId(chainId);

  const env = useEnv();

  if (chainId === anvil.id) {
    return {
      type: "sqlite" as const,
      url: new URL("/q", `http://localhost:${env.DEV_INDEXER_PORT}`).toString(),
    };
  }

  const chainName = chainIdToName[chainId];
  const chain = supportedChains[chainName] as MUDChain;

  return {
    type: "hosted" as const,
    url: new URL("/q", env.INDEXER_URL ? env.INDEXER_URL : chain.indexerUrl).toString(),
  };
}
