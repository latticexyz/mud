// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { ISystem } from "solecs/interfaces/ISystem.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById, getComponentById, addressToEntity, getSystemAddressById } from "solecs/utils.sol";

import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";
import { LibPrototype } from "../libraries/LibPrototype.sol";

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
import { SpawnPointComponent, ID as SpawnPointComponentID } from "../components/SpawnPointComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";

import { ID as SoldierID } from "../prototypes/SoldierPrototype.sol";
import { ID as DonkeyID } from "../prototypes/DonkeyPrototype.sol";
import { ID as SettlementID } from "../prototypes/SettlementPrototype.sol";
import { ID as InventoryID } from "../prototypes/InventoryPrototype.sol";

uint256 constant ID = uint256(keccak256("ember.system.playerJoin"));

contract PlayerJoinSystem is ISystem {
  IUint256Component components;
  IWorld world;

  constructor(IUint256Component _components, IWorld _world) {
    components = _components;
    world = _world;
  }

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    PlayerComponent playerComponent = PlayerComponent(getAddressById(components, PlayerComponentID));
    require(!playerComponent.has(addressToEntity(msg.sender)), "player already spawned");

    uint256 spawnEntity = abi.decode(arguments, (uint256));
    require(
      SpawnPointComponent(getAddressById(components, SpawnPointComponentID)).has(spawnEntity),
      "that is not a spawn point"
    );

    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    require(positionComponent.has(spawnEntity), "spawn has no location");
    Coord memory spawnPosition = positionComponent.getValue(spawnEntity);

    Coord[] memory unitPositions = new Coord[](4);

    unitPositions[0] = Coord(spawnPosition.x + 1, spawnPosition.y);
    unitPositions[1] = Coord(spawnPosition.x - 1, spawnPosition.y);
    unitPositions[2] = Coord(spawnPosition.x, spawnPosition.y + 1);
    unitPositions[3] = Coord(spawnPosition.x, spawnPosition.y - 1);

    return abi.encode(spawnEntity, unitPositions, playerComponent);
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 spawnEntity, Coord[] memory unitPositions, PlayerComponent playerComponent) = abi.decode(
      requirement(arguments),
      (uint256, Coord[], PlayerComponent)
    );

    // Create player entity
    uint256 playerEntity = addressToEntity(msg.sender);
    playerComponent.set(playerEntity);
    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(spawnEntity, playerEntity);
    LastActionTurnComponent(getAddressById(components, LastActionTurnComponentID)).set(
      spawnEntity,
      LibStamina.getCurrentTurn(components)
    );

    for (uint256 i; i < unitPositions.length; i++) {
      spawnDonkey(playerEntity, unitPositions[i]);
    }
  }

  function requirementTyped(uint256 spawnEntity) public view returns (bytes memory) {
    return requirement(abi.encode(spawnEntity));
  }

  function executeTyped(uint256 spawnEntity) public returns (bytes memory) {
    return execute(abi.encode(spawnEntity));
  }

  // ------------------------
  // Internals
  // ------------------------

  function spawnDonkey(uint256 ownerId, Coord memory position) private {
    uint256 entity = LibPrototype.copyPrototype(components, world, DonkeyID);

    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(entity, ownerId);

    PositionComponent(getAddressById(components, PositionComponentID)).set(entity, position);

    LastActionTurnComponent(getAddressById(components, LastActionTurnComponentID)).set(
      entity,
      LibStamina.getCurrentTurn(components) - 3
    );
  }

  function spawnSettlement(uint256 ownerId, Coord memory position) private {
    uint256 entity = LibPrototype.copyPrototype(components, world, SettlementID);

    OwnedByComponent(getAddressById(components, OwnedByComponentID)).set(entity, ownerId);

    PositionComponent(getAddressById(components, PositionComponentID)).set(entity, position);

    LastActionTurnComponent(getAddressById(components, LastActionTurnComponentID)).set(
      entity,
      LibStamina.getCurrentTurn(components) - 5
    );
  }
}
