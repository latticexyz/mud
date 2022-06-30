import { Clock } from "@latticexyz/network";
import { Component, Type, World } from "@latticexyz/recs";
import { getCurrentTurn } from "@latticexyz/std-client";
import { distinctUntilChanged, filter, map } from "rxjs";

export function createTurnStream(
  world: World,
  gameConfigComponent: Component<{ startTime: Type.String; turnLength: Type.String }>,
  clock: Clock
) {
  return clock.time$.pipe(
    map(() => getCurrentTurn(world, gameConfigComponent, clock)),
    filter((turn) => turn !== -1),
    distinctUntilChanged()
  );
}
