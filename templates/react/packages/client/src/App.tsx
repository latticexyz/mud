import { stash } from "./mud/stash";
import { useSyncProgress } from "./mud/useSyncProgress";
import { useRecords } from "./mud/useRecords";
import { AccountButton } from "@latticexyz/entrykit/internal";
import { Direction } from "./common";
import mudConfig from "contracts/mud.config";
import { useMemo } from "react";
import { GameMap } from "./GameMap";
import { useWorldContract } from "./mud/useWorldContract";

export function App() {
  const { isLive, message, percentage } = useSyncProgress();

  const players = useRecords({ stash, table: mudConfig.tables.app__Position });

  const worldContract = useWorldContract();
  const onMove = useMemo(
    () =>
      worldContract
        ? async (direction: Direction) => {
            await worldContract.write.app__move([mudConfig.enums.Direction.indexOf(direction)]);
          }
        : undefined,
    [worldContract],
  );

  return (
    <>
      <div className="fixed inset-0 grid place-items-center p-4">
        {isLive ? (
          <GameMap players={players} onMove={onMove} />
        ) : (
          <div className="tabular-nums">
            {message} ({percentage.toFixed(1)}%)…
          </div>
        )}
      </div>
      <div className="fixed top-2 right-2">
        <AccountButton />
      </div>
    </>
  );
}
