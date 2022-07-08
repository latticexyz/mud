// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { GameConfigComponent, ID as GameConfigComponentID, GameConfig, GodID } from "../components/GameConfigComponent.sol";
import { StaminaComponent, Stamina } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent } from "../components/LastActionTurnComponent.sol";

library LibStamina {
  function modifyStamina(
    StaminaComponent staminaComponent,
    LastActionTurnComponent lastActionTurnComponent,
    GameConfigComponent gameConfigComponent,
    uint256 entity,
    uint32 amount
  ) internal {
    require(staminaComponent.has(entity), "entity has no stamina");
    require(lastActionTurnComponent.has(entity), "entity has no last action turn");

    uint32 currentTurn = getCurrentTurn(gameConfigComponent);
    Stamina memory stamina = staminaComponent.getValue(entity);

    uint32 staminaSinceLastAction = uint32(
      (currentTurn - lastActionTurnComponent.getValue(entity)) * stamina.regeneration
    );
    uint32 updatedStamina = stamina.current + staminaSinceLastAction;

    if (updatedStamina > stamina.max) {
      updatedStamina = stamina.max;
    }

    require(updatedStamina >= amount, "entity has not enough stamina");

    lastActionTurnComponent.set(entity, currentTurn);
    staminaComponent.set(
      entity,
      Stamina({ current: updatedStamina - amount, max: stamina.max, regeneration: stamina.regeneration })
    );
  }

  function getCurrentTurn(GameConfigComponent gameConfigComponent) internal view returns (uint32) {
    GameConfig memory gameConfig = gameConfigComponent.getValue(GodID);

    uint256 secondsSinceGameStart = block.timestamp - gameConfig.startTime;
    return uint32(secondsSinceGameStart / gameConfig.turnLength);
  }
}
