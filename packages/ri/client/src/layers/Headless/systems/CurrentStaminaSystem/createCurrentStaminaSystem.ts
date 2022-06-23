import {
  defineUpdateSystem,
  getComponentValue,
  getComponentValueStrict,
  Has,
  runQuery,
  setComponent,
} from "@latticexyz/recs";
import { getCurrentTurn } from "@latticexyz/std-client";
import { BigNumber } from "ethers";
import { HeadlessLayer } from "../..";

export function createCurrentStaminaSystem(layer: HeadlessLayer) {
  const blockNumber$ = layer.parentLayers.network.network.blockNumber$;
  const { CurrentStamina, LastActionTurn, StaminaRegeneration, MaxStamina, GameConfig } =
    layer.parentLayers.network.components;
  const { LocalCurrentStamina } = layer.components;

  defineUpdateSystem(layer.world, [Has(CurrentStamina), Has(LocalCurrentStamina)], ({ entity, value, component }) => {
    if (component !== CurrentStamina) return;

    const localStamina = getComponentValue(LocalCurrentStamina, entity)?.value;
    if (!localStamina) return;

    const [updatedValue] = value;
    if (!updatedValue?.value) return;

    if (updatedValue.value != localStamina)
      setComponent(LocalCurrentStamina, entity, { value: updatedValue.value as number });
  });

  blockNumber$.forEach(() => {
    const entities = runQuery([Has(CurrentStamina), Has(LastActionTurn), Has(StaminaRegeneration), Has(MaxStamina)]);
    const currentTurn = getCurrentTurn(
      layer.world,
      GameConfig,
      BigNumber.from(layer.parentLayers.network.network.clock.currentTime / 1000)
    );

    for (const entity of entities) {
      const contractStamina = getComponentValueStrict(CurrentStamina, entity).value;
      const lastActionTurn = getComponentValueStrict(LastActionTurn, entity).value;
      const staminaRegeneration = getComponentValueStrict(StaminaRegeneration, entity).value;
      const maxStamina = getComponentValueStrict(MaxStamina, entity).value;

      // No new stamina tick
      if (currentTurn - lastActionTurn === 0) {
        setComponent(LocalCurrentStamina, entity, { value: contractStamina });
      } else {
        const staminaTicks = (currentTurn - lastActionTurn) * staminaRegeneration;
        let localStamina = contractStamina + staminaTicks;
        if (localStamina > maxStamina) localStamina = maxStamina;
        if (localStamina < 0) localStamina = 0;

        setComponent(LocalCurrentStamina, entity, { value: localStamina });
      }
    }
  });
}
