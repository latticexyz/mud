// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { Inventory } from "../codegen/Tables.sol";

contract InventorySystem is System {
  function pickUp(uint32 item, uint32 itemVariant) public {
    uint32 previousAmount = Inventory.get(_msgSender(), item, itemVariant);
    Inventory.set(_msgSender(), item, itemVariant, previousAmount + 1);
  }
}
