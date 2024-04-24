import { useChains } from "wagmi";
import { useRelayChains } from "./useRelayChains";
import { useAppChain } from "../../useAppChain";
import { useMemo } from "react";
import { isDefined } from "@latticexyz/common/utils";
import { DepositMethod } from "./constants";

export function useSourceChains() {
  const appChain = useAppChain();
  const chains = useChains();
  const { data: relayChains } = useRelayChains();

  const sourceChains = useMemo(() => {
    const canRelay = relayChains?.find((c) => c.id === appChain.id);
    return chains
      .map((chain) => {
        const relayChain = relayChains?.find((c) => c.id === chain.id);
        const depositMethods = [
          appChain.id === chain.id ? ("transfer" as const) : undefined,
          appChain.sourceId === chain.id ? ("bridge" as const) : undefined,
          canRelay && relayChain ? ("relay" as const) : undefined,
        ].filter(isDefined) satisfies DepositMethod[];
        return {
          ...chain,
          relayChain,
          depositMethods,
        };
      })
      .filter((c) => c.depositMethods.length > 0);
  }, [appChain.id, appChain.sourceId, chains, relayChains]);

  console.log(
    "sourceChains",
    sourceChains.map((c) => ({ id: c.id, depositMethods: c.depositMethods })),
  );
  return sourceChains;
}
