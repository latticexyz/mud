// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibECS } from "std-contracts/libraries/LibECS.sol";

import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { StaminaComponent, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";
import { GameConfigComponent, ID as GameConfigComponentID } from "../components/GameConfigComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "../components/MovableComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";

uint256 constant ID = uint256(keccak256("ember.system.simple"));

contract SimpleSystem is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    uint256 entity = abi.decode(arguments, (uint256));
    return abi.encode(entity);
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    uint256 entity = abi.decode(requirement(arguments), (uint256));

    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    if (!positionComponent.has(entity)) {
      positionComponent.set(entity, Coord({ x: 0, y: 0 }));
    } else {
      Coord memory position = positionComponent.getValue(entity);
      positionComponent.set(entity, Coord({ x: position.x + 1, y: position.y + 1 }));
    }
  }

  function requirementTyped(uint256 entity) public view returns (bytes memory) {
    return requirement(abi.encode(entity));
  }

  function executeTyped(uint256 entity) public returns (bytes memory) {
    return execute(abi.encode(entity));
  }
}
