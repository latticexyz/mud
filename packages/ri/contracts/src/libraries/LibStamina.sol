// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { GameConfigComponent, ID as GameConfigComponentID, GameConfig, GodID } from "../components/GameConfigComponent.sol";
import { StaminaComponent, ID as StaminaComponentID, Stamina } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";

library LibStamina {
  function modifyStamina(
    IUint256Component components,
    uint256 entity,
    int32 amount
  ) internal {
    (int32 updatedStamina, int32 currentTurn) = getUpdatedStamina(components, entity);

    StaminaComponent staminaComponent = StaminaComponent(getAddressById(components, StaminaComponentID));
    Stamina memory stamina = staminaComponent.getValue(entity);

    // Cap stamina regen at max stamina
    if (updatedStamina > stamina.max) {
      updatedStamina = stamina.max;
    }

    updatedStamina += amount;

    // Cap stamina modification at max stamina
    if (updatedStamina > stamina.max) {
      updatedStamina = stamina.max;
    }

    require(updatedStamina > 0, "not enough stamina");

    LastActionTurnComponent(getAddressById(components, LastActionTurnComponentID)).set(entity, currentTurn);

    staminaComponent.set(
      entity,
      Stamina({ current: updatedStamina + amount, max: stamina.max, regeneration: stamina.regeneration })
    );
  }

  function getUpdatedStamina(IUint256Component components, uint256 entity)
    internal
    view
    returns (int32 updatedStamina, int32 currentTurn)
  {
    StaminaComponent staminaComponent = StaminaComponent(getAddressById(components, StaminaComponentID));
    GameConfigComponent gameConfigComponent = GameConfigComponent(getAddressById(components, GameConfigComponentID));
    LastActionTurnComponent lastActionTurnComponent = LastActionTurnComponent(
      getAddressById(components, LastActionTurnComponentID)
    );

    require(staminaComponent.has(entity), "entity has no stamina");
    require(lastActionTurnComponent.has(entity), "entity has no last action turn");

    currentTurn = getCurrentTurn(gameConfigComponent);
    Stamina memory stamina = staminaComponent.getValue(entity);

    int32 staminaSinceLastAction = (currentTurn - lastActionTurnComponent.getValue(entity)) * stamina.regeneration;
    updatedStamina = stamina.current + staminaSinceLastAction;
  }

  function getCurrentTurn(GameConfigComponent gameConfigComponent) internal view returns (int32) {
    GameConfig memory gameConfig = gameConfigComponent.getValue(GodID);

    uint256 secondsSinceGameStart = block.timestamp - gameConfig.startTime;
    return int32(uint32(secondsSinceGameStart / gameConfig.turnLength));
  }
}
