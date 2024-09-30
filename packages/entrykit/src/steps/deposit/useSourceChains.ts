import { useChains } from "wagmi";
import { useRelay } from "./useRelay";
import { useAppChain } from "../../useAppChain";
import { useMemo } from "react";
import { isDefined } from "@latticexyz/common/utils";
import { SourceChain } from "./common";

// TODO: define list of chains we support for bridging? our bridge logic is very OP specific

export function useSourceChains(): readonly SourceChain[] {
  const appChain = useAppChain();
  const chains = useChains();
  const relay = useRelay();

  // TODO: add helper in viem's op-stack to detect if given chain can use deposit functions instead of figuring it out here
  const portalAddress = appChain.sourceId ? appChain.contracts?.portal?.[appChain.sourceId]?.address : undefined;

  const relayChains = relay.data?.chains;
  const canRelay = relayChains?.find((c) => c.id === appChain.id);

  const sourceChains = useMemo(() => {
    return chains
      .map((sourceChain): SourceChain => {
        const canBridge = appChain.sourceId === sourceChain.id;
        const relayChain = relayChains?.find((c) => c.id === sourceChain.id);

        const depositMethods = (
          appChain.id === sourceChain.id
            ? ["transfer"]
            : [
                canBridge && portalAddress ? ("bridge" as const) : undefined,
                canRelay && relayChain ? ("relay" as const) : undefined,
              ].filter(isDefined)
        ) satisfies SourceChain["depositMethods"];

        return {
          ...sourceChain,
          depositMethods,
          // TODO: I think we can remove this for now since we're using viem's op-stack actions
          portalAddress: canBridge ? portalAddress : undefined,
          relayChain,
        };
      })
      .filter((c) => c.depositMethods.length > 0);
  }, [appChain.id, appChain.sourceId, canRelay, chains, portalAddress, relayChains]);

  return sourceChains;
}
