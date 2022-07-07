// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { ISystem } from "solecs/interfaces/ISystem.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById, getComponentById, addressToEntity } from "solecs/utils.sol";

import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";

import { PlayerComponent, ID as PlayerComponentID } from "../components/PlayerComponent.sol";
import { GameConfigComponent, ID as GameConfigComponentID, GameConfig, GodID } from "../components/GameConfigComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "../components/MovableComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { StaminaComponent, Stamina, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";
import { HealthComponent, Health, ID as HealthComponentID } from "../components/HealthComponent.sol";
import { AttackComponent, Attack, ID as AttackComponentID } from "../components/AttackComponent.sol";

uint256 constant ID = uint256(keccak256("ember.system.playerJoin"));

contract PlayerJoinSystem is ISystem {
  IUint256Component components;
  IWorld world;

  constructor(IUint256Component _components, IWorld _world) {
    components = _components;
    world = _world;
  }

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    IComponent playerComponent = getComponentById(components, PlayerComponentID);
    require(!playerComponent.has(addressToEntity(msg.sender)), "player already spawned");

    Coord memory position = abi.decode(arguments, (Coord));
    Coord[] memory spawnPositions = new Coord[](5);

    spawnPositions[0] = position;
    spawnPositions[1] = Coord(position.x + 1, position.y);
    spawnPositions[2] = Coord(position.x - 1, position.y);
    spawnPositions[3] = Coord(position.x, position.y + 1);
    spawnPositions[4] = Coord(position.x, position.y - 1);

    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    for (uint256 i; i < spawnPositions.length; i++) {
      require(positionComponent.getEntitiesWithValue(spawnPositions[i]).length == 0, "spot taken");
    }

    return abi.encode(playerComponent, spawnPositions);
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (IComponent playerComponent, Coord[] memory spawnPositions) = abi.decode(
      requirement(arguments),
      (IComponent, Coord[])
    );

    // Create player entity
    uint256 playerEntity = addressToEntity(msg.sender);
    PlayerComponent(address(playerComponent)).set(addressToEntity(msg.sender));

    // Spawn creatures
    for (uint256 i; i < spawnPositions.length; i++) {
      spawnSoldier(playerEntity, spawnPositions[i]);
    }
  }

  function requirementTyped(Coord memory targetPosition) public view returns (bytes memory) {
    return requirement(abi.encode(targetPosition));
  }

  function executeTyped(Coord memory targetPosition) public returns (bytes memory) {
    return execute(abi.encode(targetPosition));
  }

  // ------------------------
  // Internals
  // ------------------------

  function spawnSoldier(uint256 ownerId, Coord memory position) private {
    uint256 entity = world.getUniqueEntityId();

    // TODO: use blueprint here (to be added in the next rebase PR);

    PositionComponent(getAddressById(components, PositionComponentID)).set(entity, position);

    LastActionTurnComponent(getAddressById(components, LastActionTurnComponentID)).set(
      entity,
      LibStamina.getCurrentTurn(GameConfigComponent(getAddressById(components, GameConfigComponentID)))
    );
  }
}
