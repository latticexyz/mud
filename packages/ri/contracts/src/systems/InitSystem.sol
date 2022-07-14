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
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";

import { SoldierPrototype } from "../prototypes/SoldierPrototype.sol";
import { DonkeyPrototype } from "../prototypes/DonkeyPrototype.sol";
import { SettlementPrototype, ID as SettlementID } from "../prototypes/SettlementPrototype.sol";
import { InventoryPrototype, ID as InventoryID } from "../prototypes/InventoryPrototype.sol";
import { EmberCrownPrototype, ID as EmberCrownID } from "../prototypes/EmberCrownPrototype.sol";
import { EscapePortalPrototype, ID as EscapePortalID } from "../prototypes/EscapePortalPrototype.sol";
import { InventoryPrototype } from "../prototypes/InventoryPrototype.sol";
import { GoldPrototype } from "../prototypes/GoldPrototype.sol";
import { EmberCrownInventoryPrototype } from "../prototypes/EmberCrownInventoryPrototype.sol";
import { EmberCrownPrototype } from "../prototypes/EmberCrownPrototype.sol";
import { EmptySettlementPrototype } from "../prototypes/EmptySettlementPrototype.sol";
import { GoldShrinePrototype } from "../prototypes/GoldShrinePrototype.sol";
import { GrassPrototype } from "../prototypes/GrassPrototype.sol";
import { GuardPrototype } from "../prototypes/GuardPrototype.sol";
import { TreePrototype } from "../prototypes/TreePrototype.sol";
import { WaterPrototype } from "../prototypes/WaterPrototype.sol";

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
    DonkeyPrototype(components, world);
    SettlementPrototype(components, world);
    EmberCrownPrototype(components);
    EmberCrownInventoryPrototype(components, world);
    EmptySettlementPrototype(components, world);
    EscapePortalPrototype(components);
    GoldShrinePrototype(components);
    GrassPrototype(components);
    GuardPrototype(components, world);
    TreePrototype(components);
    WaterPrototype(components);
  }
}
