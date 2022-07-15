import {
  defineComponentSystem,
  defineQuery,
  defineRxSystem,
  EntityIndex,
  getComponentValueStrict,
  Has,
  setComponent,
  UpdateType,
} from "@latticexyz/recs";
import { getCurrentTurn } from "@latticexyz/std-client";
import { HeadlessLayer } from "../../types";

export function createCurrentStaminaSystem(layer: HeadlessLayer) {
  const {
    world,
    turn$,
    parentLayers: {
      network: {
        network: { clock },
        components: { Stamina, LastActionTurn, GameConfig },
      },
    },
    components: { LocalStamina },
  } = layer;

  const setLocalStaminaToCurrentTurn = (entity: EntityIndex) => {
    const currentTurn = getCurrentTurn(layer.world, GameConfig, clock);
    const contractStamina = getComponentValueStrict(Stamina, entity);
    const lastActionTurn = getComponentValueStrict(LastActionTurn, entity)?.value;
    const staminaTicks = (currentTurn - lastActionTurn) * contractStamina.regeneration;

    let localStamina = contractStamina.current + staminaTicks;
    if (localStamina > contractStamina.max) localStamina = contractStamina.max;
    if (localStamina < 0) localStamina = 0;

    setComponent(LocalStamina, entity, { current: localStamina });
  };

  defineComponentSystem(world, Stamina, ({ entity, value }) => {
    const [newValue] = value;
    const newCurrentStamina = newValue?.current;
    if (newCurrentStamina == null) return;

    setComponent(LocalStamina, entity, { current: newCurrentStamina });
  });

  const staminaQuery = defineQuery([Has(Stamina), Has(LastActionTurn)]);

  defineRxSystem(world, staminaQuery.update$, ({ entity, type }) => {
    if (type === UpdateType.Enter) setLocalStaminaToCurrentTurn(entity);
  });

  defineRxSystem(world, turn$, () => {
    for (const entity of staminaQuery.matching) {
      setLocalStaminaToCurrentTurn(entity);
    }
  });
}
