import { getComponentValue } from "@latticexyz/recs";
import { uuid, awaitStreamValue } from "@latticexyz/utils";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { worldSend, txReduced$, singletonEntity }: SetupNetworkResult,
  { Counter }: ClientComponents
) {
  const increment = async () => {
    const tx = await worldSend("increment", []);
    await awaitStreamValue(txReduced$, (txHash) => txHash === tx.hash);
    return getComponentValue(Counter, singletonEntity);
  };

  const optimisticIncrement = async () => {
    const currentValue = getComponentValue(Counter, singletonEntity)?.value ?? 0;

    const overrideId = uuid();
    Counter.addOverride(overrideId, {
      entity: singletonEntity,
      value: { value: currentValue + 1 },
    });

    try {
      const tx = await worldSend("increment", []);
      await awaitStreamValue(txReduced$, (txHash) => txHash === tx.hash);
      return getComponentValue(Counter, singletonEntity);
    } finally {
      Counter.removeOverride(overrideId);
    }
  };

  return {
    increment,
    optimisticIncrement,
  };
}
