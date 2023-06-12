import { awaitStreamValue } from "@latticexyz/utils";
import { SetupNetworkResult } from "./setupNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls({ worldSend, txReduced$ }: SetupNetworkResult) {
  const move = async (x: number, y: number, z: number) => {
    const tx = await worldSend("move", [x, y, z]);
    await awaitStreamValue(txReduced$, (txHash) => txHash === tx.hash);
  };

  return {
    move,
  };
}
