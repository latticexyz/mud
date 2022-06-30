import { Clock } from "@latticexyz/network";
import { Component, defineEnterSystem, Has, Type, World } from "@latticexyz/recs";
import { getCurrentTurn } from "@latticexyz/std-client";
import { filter, map, ReplaySubject } from "rxjs";

export function createNewTurnStream(
  world: World,
  gameConfigComponent: Component<{ startTime: Type.String; turnLength: Type.String }>,
  clock: Clock
) {
  let lastTurn = 0;
  const newTurn$ = new ReplaySubject<number>();

  function tick(newTurn: number) {
    lastTurn = newTurn;
    newTurn$.next(newTurn);
  }

  defineEnterSystem(world, [Has(gameConfigComponent)], () => {
    clock.time$
      .pipe(
        map(() => getCurrentTurn(world, gameConfigComponent, clock)),
        filter((newTurn) => newTurn > lastTurn)
      )
      .subscribe(tick);
  });

  return newTurn$;
}
