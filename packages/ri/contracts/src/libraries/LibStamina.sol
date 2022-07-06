// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { LibAppStorage, AppStorage } from "./LibAppStorage.sol";

import { GameConfigComponent, ID as GameConfigComponentID, GameConfig, GodID } from "../components/GameConfigComponent.sol";
import { StaminaComponent, Stamina, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";

library LibStamina {
  function s() internal pure returns (AppStorage storage) {
    return LibAppStorage.diamondStorage();
  }

  function reduceStamina(uint256 entity, int32 amount) public {
    require(amount > 0, "nice try");

    (
      StaminaComponent staminaComponent,
      LastActionTurnComponent lastActionTurnComponent
    ) = _getRequiredStaminaComponents(entity);
    (int32 updatedStamina, int32 atTurn) = _getUpdatedStamina(entity, staminaComponent, lastActionTurnComponent);

    Stamina memory stamina = staminaComponent.getValue(entity);

    lastActionTurnComponent.set(entity, atTurn);
    staminaComponent.set(
      entity,
      Stamina({ current: updatedStamina - amount, max: stamina.max, regeneration: stamina.regeneration })
    );
  }

  function getUpdatedStamina(uint256 entity) public view returns (int32 updatedStamina, int32 atTurn) {
    (StaminaComponent stamina, LastActionTurnComponent lastActionTurn) = _getRequiredStaminaComponents(entity);
    return _getUpdatedStamina(entity, stamina, lastActionTurn);
  }

  function _getUpdatedStamina(
    uint256 entity,
    StaminaComponent staminaComponent,
    LastActionTurnComponent lastActionTurnComponent
  ) private view returns (int32 updatedStamina, int32 atTurn) {
    Stamina memory stamina = staminaComponent.getValue(entity);
    atTurn = getCurrentTurn();
    int32 staminaSinceLastAction = int32((atTurn - lastActionTurnComponent.getValue(entity)) * stamina.regeneration);
    updatedStamina = stamina.current + staminaSinceLastAction;

    if (updatedStamina > stamina.max) {
      updatedStamina = stamina.max;
    }
  }

  function _getRequiredStaminaComponents(uint256 entity)
    private
    view
    returns (StaminaComponent staminaComponent, LastActionTurnComponent lastActionTurnComponent)
  {
    staminaComponent = StaminaComponent(s().world.getComponent(StaminaComponentID));
    require(staminaComponent.has(entity), "entity does not have stamina");

    lastActionTurnComponent = LastActionTurnComponent(s().world.getComponent(LastActionTurnComponentID));
    require(lastActionTurnComponent.has(entity), "entity has no LastActionTurn");
  }

  function getCurrentTurn() public view returns (int32) {
    GameConfigComponent gameConfigComponent = GameConfigComponent(s().world.getComponent(GameConfigComponentID));
    GameConfig memory gameConfig = gameConfigComponent.getValue(GodID);

    uint256 secondsSinceGameStart = block.timestamp - gameConfig.startTime;
    return int32(uint32(secondsSinceGameStart / gameConfig.turnLength));
  }
}
