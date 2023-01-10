import { GodID as SingletonID, TxQueue } from "@latticexyz/network";
import { World } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";
import { useComponentValueStream } from "@latticexyz/std-client";
import { components, singletonIndex } from ".";

type Props = {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: typeof components;
};

export const App = ({ systems, components }: Props) => {
  const counter = useComponentValueStream(components.Counter, singletonIndex);
  return (
    <>
      <div>
        Counter: <span>{counter?.value ?? "??"}</span>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          systems["system.Increment"].executeTyped(SingletonID);
        }}
      >
        Increment
      </button>
    </>
  );
};
