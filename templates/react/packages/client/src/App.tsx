import { stash } from "./mud/stash";
import { useRecords } from "@latticexyz/stash/react";
import { AccountButton } from "@latticexyz/entrykit/internal";
import { Direction } from "./common";
import mudConfig from "contracts/mud.config";
import { useMemo } from "react";
import { GameMap } from "./GameMap";
import { useWorldContract } from "./mud/useWorldContract";
import { Loading } from "./mud/Loading";

console.log("env", import.meta.env);

export function App() {
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
        <Loading>
          <GameMap players={players} onMove={onMove} />
        </Loading>
      </div>
      <div className="fixed top-2 right-2">
        <AccountButton />
      </div>
    </>
  );
}
