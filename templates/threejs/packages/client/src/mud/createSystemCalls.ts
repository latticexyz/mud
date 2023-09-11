/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import { getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  /*
   * The parameter list informs TypeScript that:
   *
   * - The first parameter is expected to be a
   *   SetupNetworkResult, as defined in setupNetwork.ts
   *
   * - Out of this parameter, we only care about two fields:
   *   - worldContract (which comes from createContract, see
   *     https://github.com/latticexyz/mud/blob/main/templates/threejs/packages/client/src/mud/setupNetwork.ts#L31).
   *   - waitForTransaction (which comes from syncToRecs, see
   *     https://github.com/latticexyz/mud/blob/main/templates/threejs/packages/client/src/mud/setupNetwork.ts#L39).
   *
   * - From the second parameter, which is a ClientComponent,
   *   we only care about Position. This parameter comes to use
   *   through createClientComponents.ts, but it originates in
   *   syncToRecs (https://github.com/latticexyz/mud/blob/main/templates/threejs/packages/client/src/mud/setupNetwork.ts#L39).
   */
  { worldContract, waitForTransaction, playerEntity }: SetupNetworkResult,
  { Position }: ClientComponents
) {
  const moveTo = async (x: number, y: number, z: number) => {
    /*
     * Because MoveSystem is in the root namespace, .move can be called directly
     * on the World contract.
     */
    const tx = await worldContract.write.move([x, y, z]);
    await waitForTransaction(tx);
  };

  const moveBy = async (deltaX: number, deltaY: number, deltaZ: number) => {
    console.log({ Position, playerEntity });
    const playerPosition = getComponentValue(Position, playerEntity);

    if (playerPosition) {
      /*
       * Because MoveSystem is in the root namespace, .moveTo can be called directly
       * on the World contract.
       */
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
