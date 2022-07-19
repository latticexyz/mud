// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { ISystem } from "solecs/interfaces/ISystem.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibECS } from "../libraries/LibECS.sol";

import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";
import { LibInventory } from "../libraries/LibInventory.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { StaminaComponent, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";
import { GameConfigComponent, ID as GameConfigComponentID } from "../components/GameConfigComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "../components/MovableComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { ResourceGeneratorComponent, ID as ResourceGeneratorComponentID } from "../components/ResourceGeneratorComponent.sol";

import { ID as GoldID } from "../prototypes/GoldPrototype.sol";

uint256 constant ID = uint256(keccak256("ember.system.gatherResource"));

contract GatherResourceSystem is ISystem {
  IUint256Component components;
  IWorld world;

  constructor(IUint256Component _components, IWorld _world) {
    components = _components;
    world = _world;
  }

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    (uint256 generator, uint256 gatherer) = abi.decode(arguments, (uint256, uint256));

    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    require(LibECS.isOwnedByCaller(components, gatherer), "you don't own this entity");

    require(LibUtils.distanceBetween(components, generator, gatherer) <= 1, "too far from generator");

    return abi.encode(generator, gatherer);
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 generator, uint256 gatherer) = abi.decode(requirement(arguments), (uint256, uint256));

    LibStamina.modifyStamina(components, generator, -2);
    LibStamina.modifyStamina(components, gatherer, -1);
    LibInventory.spawnItem(components, world, gatherer, GoldID);
  }

  function requirementTyped(uint256 generator, uint256 gatherer) public view returns (bytes memory) {
    return requirement(abi.encode(generator, gatherer));
  }

  function executeTyped(uint256 generator, uint256 gatherer) public returns (bytes memory) {
    return execute(abi.encode(generator, gatherer));
  }
}
