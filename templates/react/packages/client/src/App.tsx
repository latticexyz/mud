import { stash } from "./mud/stash";
import { useRecords } from "@latticexyz/stash/react";
import { AccountButton } from "@latticexyz/entrykit/internal";
import { Direction } from "./common";
import mudConfig from "contracts/mud.config";
import { useMemo } from "react";
import { GameMap } from "./game/GameMap";
import { useWorldContract } from "./mud/useWorldContract";
import { Synced } from "./mud/Synced";
import { useSync } from "@latticexyz/store-sync/react";

export function App() {
  const players = useRecords({ stash, table: mudConfig.tables.app__Position });

  const sync = useSync();
  const worldContract = useWorldContract();
  const onMove = useMemo(
    () =>
      sync.data && worldContract
        ? async (direction: Direction) => {
            const tx = await worldContract.write.app__move([mudConfig.enums.Direction.indexOf(direction)]);
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
          <GameMap players={players} onMove={onMove} />
        </Synced>
      </div>
      <div className="fixed top-2 right-2">
        <AccountButton />
      </div>
    </>
  );
}
