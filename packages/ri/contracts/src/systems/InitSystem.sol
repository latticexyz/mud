// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { ISystem } from "solecs/interfaces/ISystem.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";

import { getAddressById, getComponentById, addressToEntity, getSystemAddressById } from "solecs/utils.sol";

import { LibPrototype } from "../libraries/LibPrototype.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { SpawnPointComponent, ID as SpawnPointComponentID } from "../components/SpawnPointComponent.sol";

import { SoldierPrototype } from "../prototypes/SoldierPrototype.sol";
import { SettlementPrototype, ID as SettlementID } from "../prototypes/SettlementPrototype.sol";

uint256 constant ID = uint256(keccak256("ember.system.init"));

enum InstanceType {
  Copy,
  Instance
}

contract InitSystem is ISystem {
  IUint256Component components;
  IWorld world;
  address owner;

  constructor(IUint256Component _components, IWorld _world) {
    components = _components;
    world = _world;
    owner = msg.sender;
  }

  function requirement(bytes memory) public view returns (bytes memory) {
    require(msg.sender == owner, "only owner can initialize");
  }

  function execute(bytes memory) public returns (bytes memory) {
    // Initialize Prototypes
    SoldierPrototype(components);
    SettlementPrototype(components);

    uint256 spawnPoint = world.getUniqueEntityId();
    LibPrototype.copyPrototype(components, SettlementID, spawnPoint);

    SpawnPointComponent(getAddressById(components, SpawnPointComponentID)).set(spawnPoint);
    PositionComponent(getAddressById(components, PositionComponentID)).set(spawnPoint, Coord(0, 0));

    spawnPoint = world.getUniqueEntityId();
    LibPrototype.copyPrototype(components, SettlementID, spawnPoint);

    SpawnPointComponent(getAddressById(components, SpawnPointComponentID)).set(spawnPoint);
    PositionComponent(getAddressById(components, PositionComponentID)).set(spawnPoint, Coord(20, 10));

    spawnPoint = world.getUniqueEntityId();
    LibPrototype.copyPrototype(components, SettlementID, spawnPoint);

    SpawnPointComponent(getAddressById(components, SpawnPointComponentID)).set(spawnPoint);
    PositionComponent(getAddressById(components, PositionComponentID)).set(spawnPoint, Coord(5, 20));
  }
}
