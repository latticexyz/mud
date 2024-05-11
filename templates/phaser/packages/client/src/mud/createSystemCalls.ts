/*
 * Creates components for use by the client.
 *
 * By default it returns the components from setupNetwork.ts, those which are
 * automatically inferred from the mud.config.ts table definitions.
 *
 * However, you can add or override components here as needed. This
 * lets you add user defined components, which may or may not have
 * an onchain component.
 */

import { getComponentValue } from "@latticexyz/recs";
import { uuid } from "@latticexyz/utils";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";
import { Direction } from "../types";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  /*
   * The parameter list informs TypeScript that:
   *
   * - The first parameter is expected to be a
   *   SetupNetworkResult, as defined in setupNetwork.ts
   *
   *   Out of this parameter, we only care about two fields:
   *   - worldContract (which comes from getContract, see
   *     https://github.com/latticexyz/mud/blob/main/templates/phaser/packages/client/src/mud/setupNetwork.ts#L61-L67).
   *
   *   - waitForTransaction (which comes from syncToRecs, see
   *     https://github.com/latticexyz/mud/blob/main/templates/phaser/packages/client/src/mud/setupNetwork.ts#L75-L81).
   *
   * - From the second parameter, which is a ClientComponent,
   *   we only care about Counter. This parameter comes to use
   *   through createClientComponents.ts, but it originates in
   *   syncToRecs
   *   (https://github.com/latticexyz/mud/blob/main/templates/phaser/packages/client/src/mud/setupNetwork.ts#L75-L81).
   */
  { playerEntity, worldContract, waitForTransaction }: SetupNetworkResult,
  { Player, Position }: ClientComponents,
) {
  const move = async (direction: Direction) => {
    if (!playerEntity) {
      throw new Error("no player");
    }

    const position = getComponentValue(Position, playerEntity);
    if (!position) {
      console.warn("cannot move without a player position, not yet spawned?");
      return;
    }

    let { x, y } = position;
    if (direction === Direction.North) {
      y -= 1;
    } else if (direction === Direction.East) {
      x += 1;
    } else if (direction === Direction.South) {
      y += 1;
    } else if (direction === Direction.West) {
      x -= 1;
    }

    const positionId = uuid();
    Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y },
    });

    try {
      const tx = await worldContract.write.move([direction]);
      await waitForTransaction(tx);
    } finally {
      Position.removeOverride(positionId);
    }
  };

  const spawn = async (x: number, y: number) => {
    if (!playerEntity) {
      throw new Error("no player");
    }

    const canSpawn = getComponentValue(Player, playerEntity)?.value !== true;
    if (!canSpawn) {
      throw new Error("already spawned");
    }

    const positionId = uuid();
    Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y },
    });
    const playerId = uuid();
    Player.addOverride(playerId, {
      entity: playerEntity,
      value: { value: true },
    });

    try {
      const tx = await worldContract.write.spawn([x, y]);
      await waitForTransaction(tx);
    } finally {
      Position.removeOverride(positionId);
      Player.removeOverride(playerId);
    }
  };

  return {
    move,
    spawn,
  };
}
