import { defineRxSystem, EntityIndex, getComponentValueStrict, Has, runQuery, setComponent } from "@latticexyz/recs";
import { getCurrentTurn } from "@latticexyz/std-client";
import { merge } from "rxjs";
import { HeadlessLayer } from "../..";

export function createCurrentStaminaSystem(layer: HeadlessLayer) {
  const {
    world,
    newTurn$,
    parentLayers: {
      network: {
        network: { clock },
        components: { Stamina, LastActionTurn, GameConfig },
      },
    },
    components: { LocalStamina },
  } = layer;

  const updateLocalStaminaToTurn = (entity: EntityIndex, turn: number) => {
    const contractStamina = getComponentValueStrict(Stamina, entity);
    const lastActionTurn = getComponentValueStrict(LastActionTurn, entity).value;
    const staminaTicks = (turn - lastActionTurn) * contractStamina.regeneration;

    let localStamina = contractStamina.current + staminaTicks;
    if (localStamina > contractStamina.max) localStamina = contractStamina.max;
    if (localStamina < 0) localStamina = 0;

    setComponent(LocalStamina, entity, { current: localStamina });
  };

  const staminaUpdate$ = merge(newTurn$, Stamina.update$);
  defineRxSystem(world, staminaUpdate$, () => {
    const entities = runQuery([Has(Stamina), Has(LastActionTurn)]);
    const currentTurn = getCurrentTurn(layer.world, GameConfig, clock);

    for (const entity of entities) {
      updateLocalStaminaToTurn(entity, currentTurn);
    }
  });
}
