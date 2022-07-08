// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { ISystem } from "solecs/interfaces/ISystem.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { ID as PlayerJoinSystem } from "./PlayerJoinSystem.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { PrototypeCopyComponent, ID as PrototypeCopyComponentID } from "../components/PrototypeCopyComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";
import { HealthComponent, Health, ID as HealthComponentID } from "../components/HealthComponent.sol";
import { AttackComponent, Attack, ID as AttackComponentID } from "../components/AttackComponent.sol";

import { SoldierPrototype } from "../prototypes/SoldierPrototype.sol";

uint256 constant ID = uint256(keccak256("ember.system.prototype"));

enum InstanceType {
  Copy,
  Instance
}

// TODO: move this back to a library and have a separate "InitSystem" that does initial setup

contract PrototypeSystem is ISystem {
  IUint256Component components;
  IWorld world;
  address owner;

  constructor(IUint256Component _components, IWorld _world) {
    components = _components;
    world = _world;
    owner = msg.sender;
  }

  function requirement(bytes memory) public view returns (bytes memory) {
    require(
      msg.sender == owner || msg.sender == getAddressById(components, PlayerJoinSystem),
      "only owner can create entities from prototypes"
    );
  }

  // For now this copies all components and values from the prototype.
  // In the future we'll add a PrototypeInstance component that does not copy the values.
  function execute(bytes memory arguments) public returns (bytes memory) {
    requirement(arguments);

    // Init
    if (arguments.length == 0) {
      init();
      return new bytes(0);
    }

    (uint256 ownerId, uint256 prototypeId, uint8 instanceType) = abi.decode(arguments, (uint256, uint256, uint8));

    require(InstanceType(instanceType) == InstanceType.Copy, "instance type is not implemented yet");

    uint256 entity = world.getUniqueEntityId();

    PrototypeCopyComponent(getAddressById(components, PrototypeCopyComponentID)).set(entity, prototypeId);
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(entity, ownerId);

    uint256[] memory prototypeComponents = PrototypeComponent(getAddressById(components, PrototypeComponentID))
      .getValue(prototypeId);

    for (uint256 i; i < prototypeComponents.length; i++) {
      IComponent c = IComponent(getAddressById(components, prototypeComponents[i]));
      c.set(entity, c.getRawValue(prototypeId));
    }

    return abi.encode(entity);
  }

  function requirementTyped() public view returns (bytes memory) {
    return requirement(new bytes(0));
  }

  function executeTyped(
    uint256 ownerId,
    uint256 prototypeId,
    InstanceType instanceType
  ) public returns (bytes memory) {
    return execute(abi.encode(ownerId, prototypeId, instanceType));
  }

  function init() public {
    require(msg.sender == owner, "only owner can initialize prototypes");
    SoldierPrototype(components);
  }
}
