// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { Inventory } from "../codegen/Tables.sol";

contract InventorySystem is System {
  function pickUp(bytes32 item, uint32 variant) public {
    uint32 previousAmount = Inventory.get(_msgSender(), item, variant);
    Inventory.set(_msgSender(), item, variant, previousAmount + 1);
  }
}
