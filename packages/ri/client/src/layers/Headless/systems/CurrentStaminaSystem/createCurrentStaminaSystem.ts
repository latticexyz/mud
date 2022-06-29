import {
  defineComponentSystem,
  defineRxSystem,
  getComponentValueStrict,
  Has,
  runQuery,
  setComponent,
} from "@latticexyz/recs";
import { getCurrentTurn } from "@latticexyz/std-client";
import { HeadlessLayer } from "../..";

export function createCurrentStaminaSystem(layer: HeadlessLayer) {
  const {
    world,
    parentLayers: {
      network: {
        network: { clock },
        components: { Stamina, LastActionTurn, GameConfig },
      },
    },
    components: { LocalCurrentStamina },
  } = layer;

  defineComponentSystem(world, Stamina, ({ entity, value }) => {
    if (value[0]) setComponent(LocalCurrentStamina, entity, { value: value[0].current });
  });

  defineRxSystem(world, clock.time$, () => {
    const entities = runQuery([Has(Stamina), Has(LastActionTurn)]);
    const currentTurn = getCurrentTurn(layer.world, GameConfig, clock);

    for (const entity of entities) {
      const contractStamina = getComponentValueStrict(Stamina, entity);
      const lastActionTurn = getComponentValueStrict(LastActionTurn, entity).value;

      // No new stamina tick
      if (currentTurn - lastActionTurn === 0) {
        setComponent(LocalCurrentStamina, entity, { value: contractStamina.current });
      } else {
        const staminaTicks = (currentTurn - lastActionTurn) * contractStamina.regeneration;
        let localStamina = contractStamina.current + staminaTicks;
        if (localStamina > contractStamina.max) localStamina = contractStamina.max;
        if (localStamina < 0) localStamina = 0;

        setComponent(LocalCurrentStamina, entity, { value: localStamina });
      }
    }
  });
}
