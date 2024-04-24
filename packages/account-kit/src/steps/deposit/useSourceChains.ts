import { useChains } from "wagmi";
import { useRelayChains } from "./useRelayChains";
import { useAppChain } from "../../useAppChain";
import { useMemo } from "react";
import { isDefined } from "@latticexyz/common/utils";
import { SourceChain } from "./common";

export function useSourceChains(): readonly SourceChain[] {
  const appChain = useAppChain();
  const chains = useChains();
  const { data: relayChains } = useRelayChains();

  const portalAddress = appChain.sourceId ? appChain.contracts?.portal?.[appChain.sourceId]?.address : undefined;
  const canRelay = relayChains?.find((c) => c.id === appChain.id);

  const sourceChains = useMemo(() => {
    return chains
      .map((chain): SourceChain => {
        const canBridge = appChain.sourceId === chain.id;
        const relayChain = relayChains?.find((c) => c.id === chain.id);

        const depositMethods = (
          appChain.id === chain.id
            ? ["transfer"]
            : [
                canBridge && portalAddress ? ("bridge" as const) : undefined,
                canRelay && relayChain ? ("relay" as const) : undefined,
              ].filter(isDefined)
        ) satisfies SourceChain["depositMethods"];

        return {
          ...chain,
          depositMethods,
          portalAddress: canBridge ? portalAddress : undefined,
          relayChain,
        };
      })
      .filter((c) => c.depositMethods.length > 0);
  }, [appChain.id, appChain.sourceId, canRelay, chains, portalAddress, relayChains]);

  return sourceChains;
}
