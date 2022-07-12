// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { ISystem } from "solecs/interfaces/ISystem.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";

import { getAddressById, getComponentById, addressToEntity, getSystemAddressById } from "solecs/utils.sol";

import { LibPrototype } from "../libraries/LibPrototype.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { SpawnPointComponent, ID as SpawnPointComponentID } from "../components/SpawnPointComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";

import { SoldierPrototype } from "../prototypes/SoldierPrototype.sol";
import { SettlementPrototype, ID as SettlementID } from "../prototypes/SettlementPrototype.sol";
import { InventoryPrototype } from "../prototypes/InventoryPrototype.sol";
import { GoldPrototype } from "../prototypes/GoldPrototype.sol";
import { GoldShrinePrototype, ID as GoldShrineID } from "../prototypes/GoldShrinePrototype.sol";

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
    InventoryPrototype(components);
    GoldPrototype(components);
    SoldierPrototype(components, world);
    SettlementPrototype(components, world);
    GoldShrinePrototype(components, world);

    uint256 spawnPoint = LibPrototype.copyPrototype(components, world, SettlementID);

    SpawnPointComponent(getAddressById(components, SpawnPointComponentID)).set(spawnPoint);
    PositionComponent(getAddressById(components, PositionComponentID)).set(spawnPoint, Coord(0, 0));

    spawnPoint = LibPrototype.copyPrototype(components, world, SettlementID);

    SpawnPointComponent(getAddressById(components, SpawnPointComponentID)).set(spawnPoint);
    PositionComponent(getAddressById(components, PositionComponentID)).set(spawnPoint, Coord(20, 10));

    spawnPoint = LibPrototype.copyPrototype(components, world, SettlementID);

    SpawnPointComponent(getAddressById(components, SpawnPointComponentID)).set(spawnPoint);
    PositionComponent(getAddressById(components, PositionComponentID)).set(spawnPoint, Coord(5, 20));

    uint256 goldShrine = LibPrototype.copyPrototype(components, world, GoldShrineID);

    PositionComponent(getAddressById(components, PositionComponentID)).set(goldShrine, Coord(7, 7));
    LastActionTurnComponent(getAddressById(components, LastActionTurnComponentID)).set(goldShrine, 0);
  }
}
