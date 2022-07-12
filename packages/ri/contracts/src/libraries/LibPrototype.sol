// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { ISystem } from "solecs/interfaces/ISystem.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { PrototypeCopyComponent, ID as PrototypeCopyComponentID } from "../components/PrototypeCopyComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";

uint256 constant ID = uint256(keccak256("ember.system.prototype"));

library LibPrototype {
  function copyPrototype(
    IUint256Component components,
    IWorld world,
    uint256 prototypeId
  ) internal returns (uint256 entityId) {
    entityId = world.getUniqueEntityId();

    PrototypeCopyComponent(getAddressById(components, PrototypeCopyComponentID)).set(entityId, prototypeId);

    uint256[] memory prototypeComponents = PrototypeComponent(getAddressById(components, PrototypeComponentID))
      .getValue(prototypeId);
    for (uint256 i; i < prototypeComponents.length; i++) {
      IComponent c = IComponent(getAddressById(components, prototypeComponents[i]));
      c.set(entityId, c.getRawValue(prototypeId));
    }

    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    uint256[] memory ownedEntities = ownedByComponent.getEntitiesWithValue(prototypeId);
    for (uint256 i = 0; i < ownedEntities.length; i++) {
      uint256 createdEntityId = copyPrototype(components, world, ownedEntities[i]);
      ownedByComponent.set(createdEntityId, entityId);
    }
  }

  function createPrototypeFromPrototype(
    IUint256Component components,
    IWorld world,
    uint256 fromPrototypeId,
    uint256 ownerPrototypeId
  ) internal returns (uint256 newPrototype) {
    require(
      PrototypeComponent(getAddressById(components, PrototypeComponentID)).has(fromPrototypeId),
      "Trying to copy non-existing prototype"
    );

    newPrototype = copyPrototype(components, world, fromPrototypeId);
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(newPrototype, ownerPrototypeId);

    uint256[] memory prototypeComponents = PrototypeComponent(getAddressById(components, PrototypeComponentID))
      .getValue(fromPrototypeId);
    PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(newPrototype, prototypeComponents);
  }
}
