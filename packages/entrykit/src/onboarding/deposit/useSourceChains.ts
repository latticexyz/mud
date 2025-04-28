import { useChains } from "wagmi";
import { useRelay } from "./useRelay";
import { useMemo } from "react";
import { SourceChain } from "./common";

export function useSourceChains(): readonly SourceChain[] {
  const chains = useChains();
  const relay = useRelay();
  const relayChains = relay.data?.chains;

  const sourceChains = useMemo(() => {
    return chains
      .map((sourceChain): SourceChain => {
        const relayChain = relayChains?.find((c) => c.id === sourceChain.id);
        return {
          ...sourceChain,
          relayChain,
        };
      })
      .filter((c) => c.relayChain);
  }, [chains, relayChains]);

  return sourceChains;
}
