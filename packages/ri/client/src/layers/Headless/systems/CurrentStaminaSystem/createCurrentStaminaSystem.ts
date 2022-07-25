import {
  defineComponentSystem,
  defineQuery,
  defineRxSystem,
  EntityIndex,
  getComponentValue,
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
    actions: { withOptimisticUpdates },
  } = layer;

  const OptimisticStamina = withOptimisticUpdates(Stamina);

  const setLocalStaminaToCurrentTurn = (entity: EntityIndex) => {
    const currentTurn = getCurrentTurn(layer.world, GameConfig, clock);
    const contractStamina = getComponentValueStrict(Stamina, entity);
    const lastActionTurn = getComponentValue(LastActionTurn, entity);
    if (!lastActionTurn) return;

    const staminaTicks = (currentTurn - lastActionTurn.value) * contractStamina.regeneration;

    let localStamina = staminaTicks;
    if (contractStamina.current + localStamina > contractStamina.max)
      localStamina = contractStamina.max - contractStamina.current;
    if (localStamina < 0) localStamina = 0;

    setComponent(LocalStamina, entity, { current: localStamina });
  };

  defineComponentSystem(world, OptimisticStamina, ({ entity, value }) => {
    const [newValue] = value;
    const newCurrentStamina = newValue?.current;
    if (newCurrentStamina == null) return;

    setComponent(LocalStamina, entity, { current: 0 });
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
