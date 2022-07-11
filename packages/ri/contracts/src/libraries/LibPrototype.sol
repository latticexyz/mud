// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { ISystem } from "solecs/interfaces/ISystem.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { PrototypeCopyComponent, ID as PrototypeCopyComponentID } from "../components/PrototypeCopyComponent.sol";

import { SoldierPrototype } from "../prototypes/SoldierPrototype.sol";

uint256 constant ID = uint256(keccak256("ember.system.prototype"));

library LibPrototype {
  function copyPrototype(
    IUint256Component components,
    uint256 prototypeId,
    uint256 entityId
  ) internal returns (uint256) {
    PrototypeCopyComponent(getAddressById(components, PrototypeCopyComponentID)).set(entityId, prototypeId);

    uint256[] memory prototypeComponents = PrototypeComponent(getAddressById(components, PrototypeComponentID))
      .getValue(prototypeId);

    for (uint256 i; i < prototypeComponents.length; i++) {
      IComponent c = IComponent(getAddressById(components, prototypeComponents[i]));
      c.set(entityId, c.getRawValue(prototypeId));
    }
  }
}
