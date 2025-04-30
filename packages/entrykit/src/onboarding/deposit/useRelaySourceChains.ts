import { useMemo } from "react";
import { Chain } from "viem";
import { useChains } from "wagmi";
import { RelayChain } from "@reservoir0x/relay-sdk";
import { useRelay } from "./useRelay";

export type SourceChain = Chain & {
  relayChain: RelayChain | undefined;
};

export function useRelaySourceChains(): readonly SourceChain[] {
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
