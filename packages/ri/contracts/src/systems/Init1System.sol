// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";

import { InventoryPrototype } from "../prototypes/InventoryPrototype.sol";
import { GoldPrototype } from "../prototypes/GoldPrototype.sol";
import { SoldierPrototype } from "../prototypes/SoldierPrototype.sol";
import { DonkeyPrototype } from "../prototypes/DonkeyPrototype.sol";
import { GuardPrototype } from "../prototypes/GuardPrototype.sol";
import { SettlementPrototype } from "../prototypes/SettlementPrototype.sol";
import { EmptySettlementPrototype } from "../prototypes/EmptySettlementPrototype.sol";

uint256 constant ID = uint256(keccak256("ember.system.init1"));

contract Init1System is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function requirement(bytes memory) public view returns (bytes memory) {
    require(msg.sender == _owner, "only owner can initialize");
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
