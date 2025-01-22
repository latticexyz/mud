import { AccountButton } from "@latticexyz/entrykit/internal";
import { Direction, Entity } from "./common";
import mudConfig from "contracts/mud.config";
import { useMemo } from "react";
import { GameMap } from "./game/GameMap";
import { useWorldContract } from "./mud/useWorldContract";
import { Synced } from "./mud/Synced";
import { useSync } from "@latticexyz/store-sync/react";
import { components } from "./mud/recs";
import { useEntityQuery } from "@latticexyz/react";
import { Has, getComponentValueStrict } from "@latticexyz/recs";
import { Address } from "viem";

export function App() {
  const playerEntities = useEntityQuery([Has(components.Owner), Has(components.Position)]);
  const players = useMemo(
    () =>
      playerEntities.map((entity) => {
        const owner = getComponentValueStrict(components.Owner, entity);
        const position = getComponentValueStrict(components.Position, entity);
        return {
          entity: entity as Entity,
          owner: owner.owner as Address,
          x: position.x,
          y: position.y,
        };
      }),
    [playerEntities],
  );

  const sync = useSync();
  const worldContract = useWorldContract();

  const onMove = useMemo(
    () =>
      sync.data && worldContract
        ? async (entity: Entity, direction: Direction) => {
            const tx = await worldContract.write.app__move([entity, mudConfig.enums.Direction.indexOf(direction)]);
            await sync.data.waitForTransaction(tx);
          }
        : undefined,
    [sync.data, worldContract],
  );

  const onSpawn = useMemo(
    () =>
      sync.data && worldContract
        ? async () => {
            const tx = await worldContract.write.app__spawn();
            await sync.data.waitForTransaction(tx);
          }
        : undefined,
    [sync.data, worldContract],
  );

  return (
    <>
      <div className="fixed inset-0 grid place-items-center p-4">
        <Synced
          fallback={({ message, percentage }) => (
            <div className="tabular-nums">
              {message} ({percentage.toFixed(1)}%)…
            </div>
          )}
        >
          <GameMap players={players} onMove={onMove} onSpawn={onSpawn} />
        </Synced>
      </div>
      <div className="fixed top-2 right-2">
        <AccountButton />
      </div>
    </>
  );
}
