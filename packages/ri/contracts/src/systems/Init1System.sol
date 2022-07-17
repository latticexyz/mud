// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { ISystem } from "solecs/interfaces/ISystem.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";

import { InventoryPrototype } from "../prototypes/InventoryPrototype.sol";
import { GoldPrototype } from "../prototypes/GoldPrototype.sol";
import { SoldierPrototype } from "../prototypes/SoldierPrototype.sol";
import { DonkeyPrototype } from "../prototypes/DonkeyPrototype.sol";
import { GuardPrototype } from "../prototypes/GuardPrototype.sol";
import { SettlementPrototype } from "../prototypes/SettlementPrototype.sol";
import { EmptySettlementPrototype } from "../prototypes/EmptySettlementPrototype.sol";

uint256 constant ID = uint256(keccak256("ember.system.init1"));

contract Init1System is ISystem {
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
    GuardPrototype(components, world);
    SettlementPrototype(components, world);
    EmptySettlementPrototype(components, world);
  }
}
