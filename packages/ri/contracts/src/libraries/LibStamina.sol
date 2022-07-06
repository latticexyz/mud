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

    StaminaComponent staminaComponent = StaminaComponent(s().world.getComponent(StaminaComponentID));
    require(staminaComponent.has(entity), "entity does not have stamina");

    LastActionTurnComponent lastActionTurnComponent = LastActionTurnComponent(
      s().world.getComponent(LastActionTurnComponentID)
    );
    require(lastActionTurnComponent.has(entity), "entity has no LastActionTurn");

    Stamina memory stamina = staminaComponent.getValue(entity);
    int32 currentTurn = getCurrentTurn();
    int32 staminaSinceLastAction = (currentTurn - lastActionTurnComponent.getValue(entity)) * stamina.regeneration;
    int32 updatedStamina = stamina.current + staminaSinceLastAction;

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

  function getCurrentTurn() public view returns (int32) {
    GameConfigComponent gameConfigComponent = GameConfigComponent(s().world.getComponent(GameConfigComponentID));
    GameConfig memory gameConfig = gameConfigComponent.getValue(GodID);

    uint256 secondsSinceGameStart = block.timestamp - gameConfig.startTime;
    return int32(uint32(secondsSinceGameStart / gameConfig.turnLength));
  }
}
