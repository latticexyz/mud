import { getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { worldContract, waitForTransaction, playerEntity }: SetupNetworkResult,
  { Position }: ClientComponents
) {
  const moveTo = async (x: number, y: number, z: number) => {
    // TODO: fix anvil issue where accounts can't send txs unless max fee is specified or is funded
    const tx = await worldContract.write.move([x, y, z], { maxFeePerGas: 0n, maxPriorityFeePerGas: 0n });
    await waitForTransaction(tx);
  };

  const moveBy = async (deltaX: number, deltaY: number, deltaZ: number) => {
    console.log({ Position, playerEntity });
    const playerPosition = getComponentValue(Position, playerEntity);

    if (playerPosition) {
      await moveTo(playerPosition.x + deltaX, playerPosition.y + deltaY, playerPosition.z + deltaZ);
    } else {
      await moveTo(deltaX, deltaY, deltaZ);
    }
  };

  return {
    moveTo,
    moveBy,
  };
}
