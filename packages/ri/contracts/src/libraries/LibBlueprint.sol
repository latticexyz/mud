// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { LibAppStorage, AppStorage } from "./LibAppStorage.sol";

import { GameConfigComponent, ID as GameConfigComponentID, GameConfig } from "../components/GameConfigComponent.sol";
import { IsBlueprintComponent, ID as IsBlueprintComponentID } from "../components/IsBlueprintComponent.sol";
import { FromBlueprintComponent, ID as FromBlueprintComponentID } from "../components/FromBlueprintComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "../components/MovableComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { StaminaComponent, Stamina, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";
import { HealthComponent, Health, ID as HealthComponentID } from "../components/HealthComponent.sol";
import { AttackComponent, Attack, ID as AttackComponentID } from "../components/AttackComponent.sol";

uint256 constant SoldierID = uint256(keccak256("ember.prototype.soldier"));

library LibBlueprint {
  function s() internal pure returns (AppStorage storage) {
    return LibAppStorage.diamondStorage();
  }

  function createFromSoldierBlueprint(uint256 ownerId) public returns (uint256 entity) {
    FromBlueprintComponent fromBlueprintComponent = FromBlueprintComponent(
      s().world.getComponent(FromBlueprintComponentID)
    );
    EntityTypeComponent entityTypeComponent = EntityTypeComponent(s().world.getComponent(EntityTypeComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(s().world.getComponent(OwnedByComponentID));
    StaminaComponent staminaComponent = StaminaComponent(s().world.getComponent(StaminaComponentID));
    LastActionTurnComponent lastActionTurnComponent = LastActionTurnComponent(
      s().world.getComponent(LastActionTurnComponentID)
    );
    MovableComponent movableComponent = MovableComponent(s().world.getComponent(MovableComponentID));
    HealthComponent healthComponent = HealthComponent(s().world.getComponent(HealthComponentID));
    AttackComponent attackComponent = AttackComponent(s().world.getComponent(AttackComponentID));

    entity = s().world.getUniqueEntityId();

    fromBlueprintComponent.set(entity, SoldierID);
    ownedByComponent.set(entity, ownerId);
    movableComponent.set(entity);
    entityTypeComponent.set(entity, entityTypeComponent.getValue(SoldierID));
    lastActionTurnComponent.set(entity, lastActionTurnComponent.getValue(SoldierID));
    staminaComponent.set(entity, staminaComponent.getValue(SoldierID));
    healthComponent.set(entity, healthComponent.getValue(SoldierID));
    attackComponent.set(entity, attackComponent.getValue(SoldierID));
  }

  function createSoldierBlueprint() public {
    IsBlueprintComponent isBlueprintComponent = IsBlueprintComponent(s().world.getComponent(IsBlueprintComponentID));
    EntityTypeComponent entityTypeComponent = EntityTypeComponent(s().world.getComponent(EntityTypeComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(s().world.getComponent(OwnedByComponentID));
    StaminaComponent staminaComponent = StaminaComponent(s().world.getComponent(StaminaComponentID));
    LastActionTurnComponent lastActionTurnComponent = LastActionTurnComponent(
      s().world.getComponent(LastActionTurnComponentID)
    );
    MovableComponent movableComponent = MovableComponent(s().world.getComponent(MovableComponentID));
    HealthComponent healthComponent = HealthComponent(s().world.getComponent(HealthComponentID));
    AttackComponent attackComponent = AttackComponent(s().world.getComponent(AttackComponentID));

    isBlueprintComponent.set(SoldierID);
    ownedByComponent.set(SoldierID, 0);
    entityTypeComponent.set(SoldierID, uint32(0));
    staminaComponent.set(SoldierID, Stamina({ current: 0, max: 3, regeneration: 1 }));
    healthComponent.set(SoldierID, Health({ current: 100_000, max: 100_000 }));
    attackComponent.set(SoldierID, Attack({ strength: 60_000, range: 1 }));
    lastActionTurnComponent.set(SoldierID, 0);
    movableComponent.set(SoldierID);
  }
}
