import { Clock } from "@latticexyz/network";
import { Component, defineEnterSystem, Has, Type, World } from "@latticexyz/recs";
import { getCurrentTurn } from "@latticexyz/std-client";
import { ReplaySubject } from "rxjs";

export function createNewTurnStream(
  world: World,
  gameConfigComponent: Component<{ startTime: Type.String; turnLength: Type.String }>,
  clock: Clock
) {
  let lastTurn = 0;
  const newTurn$ = new ReplaySubject<number>();

  defineEnterSystem(world, [Has(gameConfigComponent)], () => {
    clock.time$.forEach(() => {
      const currentTurn = getCurrentTurn(world, gameConfigComponent, clock);
      if (currentTurn > lastTurn) {
        lastTurn = currentTurn;
        newTurn$.next(currentTurn);
      }
    });
  });

  return newTurn$;
}
