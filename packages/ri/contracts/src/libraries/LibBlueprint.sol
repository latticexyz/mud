// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { LibAppStorage, AppStorage } from "./LibAppStorage.sol";

import { Component } from "solecs/Component.sol";
import { GameConfigComponent, ID as GameConfigComponentID, GameConfig } from "../components/GameConfigComponent.sol";
import { BlueprintComponentsComponent, ID as BlueprintComponentsComponentID, BlueprintComponents } from "../components/BlueprintComponentsComponent.sol";
import { IsBlueprintComponent, ID as IsBlueprintComponentID } from "../components/IsBlueprintComponent.sol";
import { FromBlueprintComponent, ID as FromBlueprintComponentID } from "../components/FromBlueprintComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "../components/MovableComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { StaminaComponent, Stamina, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";
import { HealthComponent, Health, ID as HealthComponentID } from "../components/HealthComponent.sol";
import { AttackComponent, Attack, ID as AttackComponentID } from "../components/AttackComponent.sol";

uint256 constant SoldierID = uint256(keccak256("ember.blueprint.soldier"));

library LibBlueprint {
  function s() internal pure returns (AppStorage storage) {
    return LibAppStorage.diamondStorage();
  }

  function createFromBlueprint(uint256 blueprintId, uint256 ownerId) public returns (uint256 entity) {
    FromBlueprintComponent fromBlueprintComponent = FromBlueprintComponent(
      s().world.getComponent(FromBlueprintComponentID)
    );
    OwnedByComponent ownedByComponent = OwnedByComponent(s().world.getComponent(OwnedByComponentID));
    BlueprintComponentsComponent blueprintComponentsComponent = BlueprintComponentsComponent(
      s().world.getComponent(BlueprintComponentsComponentID)
    );

    entity = s().world.getUniqueEntityId();

    fromBlueprintComponent.set(entity, blueprintId);
    ownedByComponent.set(entity, ownerId);

    BlueprintComponents memory blueprintComponents = blueprintComponentsComponent.getValue(blueprintId);
    for (uint256 i = 0; i < blueprintComponents.componentIds.length; i++) {
      Component _c = Component(s().world.getComponent(blueprintComponents.componentIds[i]));
      _c.set(entity, _c.getRawValue(blueprintId));
    }
  }

  function createSoldierBlueprint() public {
    IsBlueprintComponent isBlueprintComponent = IsBlueprintComponent(s().world.getComponent(IsBlueprintComponentID));
    BlueprintComponentsComponent blueprintComponentsComponent = BlueprintComponentsComponent(
      s().world.getComponent(BlueprintComponentsComponentID)
    );
    EntityTypeComponent entityTypeComponent = EntityTypeComponent(s().world.getComponent(EntityTypeComponentID));
    StaminaComponent staminaComponent = StaminaComponent(s().world.getComponent(StaminaComponentID));
    LastActionTurnComponent lastActionTurnComponent = LastActionTurnComponent(
      s().world.getComponent(LastActionTurnComponentID)
    );
    MovableComponent movableComponent = MovableComponent(s().world.getComponent(MovableComponentID));
    HealthComponent healthComponent = HealthComponent(s().world.getComponent(HealthComponentID));
    AttackComponent attackComponent = AttackComponent(s().world.getComponent(AttackComponentID));

    isBlueprintComponent.set(SoldierID);
    entityTypeComponent.set(SoldierID, uint32(0));
    staminaComponent.set(SoldierID, Stamina({ current: 0, max: 3, regeneration: 1 }));
    healthComponent.set(SoldierID, Health({ current: 100_000, max: 100_000 }));
    attackComponent.set(SoldierID, Attack({ strength: 60_000, range: 1 }));
    lastActionTurnComponent.set(SoldierID, 0);
    movableComponent.set(SoldierID, int32(3));

    uint256[] memory componentIds = new uint256[](6);
    componentIds[0] = EntityTypeComponentID;
    componentIds[1] = StaminaComponentID;
    componentIds[2] = LastActionTurnComponentID;
    componentIds[3] = MovableComponentID;
    componentIds[4] = HealthComponentID;
    componentIds[5] = AttackComponentID;

    blueprintComponentsComponent.set(SoldierID, BlueprintComponents({ componentIds: componentIds }));
  }
}
